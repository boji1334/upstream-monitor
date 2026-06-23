// Upstream Token auto sync - background service worker.
// Auto checks are silent: they only read tokens from already-open upstream tabs.
// Manual sync may open a minimized temporary window, then closes it immediately.

function dashboardUrl(value) {
  try {
    var url = new URL(value);
    url.pathname = "/dashboard";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch (error) {
    return value;
  }
}

function hostOf(value) {
  try {
    return new URL(value).host;
  } catch (error) {
    return "";
  }
}

function waitForTabLoaded(tabId, timeoutMs) {
  timeoutMs = timeoutMs || 25000;
  return new Promise(function (resolve, reject) {
    var done = false;
    var timer = setTimeout(function () {
      if (done) return;
      done = true;
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error("打开上游后台超时"));
    }, timeoutMs);
    function finish() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }
    function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === "complete") finish();
    }
    chrome.tabs.onUpdated.addListener(listener);
    chrome.tabs.get(tabId, function (tab) {
      if (!chrome.runtime.lastError && tab && tab.status === "complete") finish();
    });
  });
}

async function readTokenFromTab(tabId) {
  var results = await chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: async function () {
      function parseJwtMeta(token) {
        var parts = String(token || "").split(".");
        if (parts.length < 2) return { expired: false };
        try {
          var base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          while (base64.length % 4) base64 += "=";
          var payload = JSON.parse(decodeURIComponent(Array.prototype.map.call(atob(base64), function (char) {
            return "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2);
          }).join("")));
          var exp = Number(payload.exp);
          if (!Number.isFinite(exp)) return { expired: false };
          return { expired: exp <= Math.floor(Date.now() / 1000), expiresAt: new Date(exp * 1000).toISOString() };
        } catch (error) {
          return { expired: false };
        }
      }
      var token = localStorage.getItem("auth_token") || "";
      var meta = parseJwtMeta(token);
      return { token: token, expired: meta.expired, expiresAt: meta.expiresAt || "", href: location.href, title: document.title };
    }
  });
  return results && results[0] && results[0].result;
}

async function readTokenFromOpenTabs(url) {
  var targetHost = hostOf(url);
  if (!targetHost) return null;
  var tabs = await chrome.tabs.query({});
  for (var i = 0; i < tabs.length; i += 1) {
    var tab = tabs[i];
    if (!tab || !tab.id || hostOf(tab.url || "") !== targetHost) continue;
    try {
      var result = await readTokenFromTab(tab.id);
      if (result && result.token) return result;
    } catch (error) {
      // Some tabs cannot be scripted; keep scanning.
    }
  }
  return null;
}

async function harvestTokenInBackgroundWindow(url) {
  var win = null;
  try {
    win = await chrome.windows.create({ url: url, focused: false, state: "minimized", type: "popup" });
    var tab = win && win.tabs && win.tabs[0];
    if (!tab) throw new Error("无法创建后台窗口");
    try { await chrome.windows.update(win.id, { focused: false, state: "minimized" }); } catch (error) {}
    await waitForTabLoaded(tab.id);
    return await readTokenFromTab(tab.id);
  } finally {
    if (win && win.id != null) {
      try { await chrome.windows.remove(win.id); } catch (error) {}
    }
  }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (!message || message.type !== "READ_AUTH_TOKEN") return false;
  (async function () {
    var upstream = message.upstream || {};
    var url = dashboardUrl(upstream.url || "");
    var allowOpenWindow = Boolean(message.allowOpenWindow);
    try {
      var result = await readTokenFromOpenTabs(url);
      if (!result && allowOpenWindow) result = await harvestTokenInBackgroundWindow(url);
      if (!result || !result.token) {
        throw new Error(allowOpenWindow
          ? "未读取到 auth_token，可能需要先登录该中转站：" + url
          : "静默模式未打开新窗口；没有找到已打开并已登录的中转站标签：" + url);
      }
      if (result.expired) throw new Error("读取到的 auth_token 已过期，请先登录该中转站：" + url);
      sendResponse({ ok: true, token: result.token, url: result.href || url });
    } catch (error) {
      sendResponse({ ok: false, error: error && error.message ? error.message : String(error), url: url });
    }
  })();
  return true;
});
