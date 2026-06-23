(function () {
  if (window.__upstreamTokenSyncInstalled) return;
  window.__upstreamTokenSyncInstalled = true;

  function isMonitorPage() {
    return Boolean(
      document.getElementById("appScreen")
      && document.getElementById("loginScreen")
      && document.querySelector(".top-actions")
      && document.querySelector("#logs")
    );
  }

  if (!isMonitorPage()) return;

  function thresholdMs() {
    var h = parseFloat(localStorage.getItem("token_sync_threshold_hours"));
    if (!Number.isFinite(h) || h < 0) h = 12;
    return h * 3600 * 1000;
  }

  var AUTO_SYNC_INTERVAL_MS = 30 * 60 * 1000;
  var syncing = false;

  var button = document.createElement("button");
  button.id = "upstreamTokenSyncBtn";
  button.type = "button";
  button.className = "btn small";
  button.textContent = "同步 Token";
  button.title = "静默检查只读取已打开的中转站；点击按钮会临时后台打开中转站补 token";

  var status = document.createElement("span");
  status.id = "upstreamTokenSyncStatus";
  status.className = "muted";
  status.style.cssText = "font-size:12px;white-space:nowrap;margin-left:2px";

  function placeButton() {
    var actions = document.querySelector(".top-actions");
    if (!actions || document.getElementById("upstreamTokenSyncBtn")) return;
    actions.insertBefore(button, actions.firstChild);
    actions.insertBefore(status, button.nextSibling);
  }

  function getConfig() {
    return fetch("/api/config", { credentials: "same-origin", headers: { "content-type": "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("读取监控配置失败 HTTP " + r.status); return r.json(); });
  }

  function patchToken(id, token) {
    return fetch("/api/upstreams/" + encodeURIComponent(id), {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: token })
    }).then(function (r) { if (!r.ok) throw new Error("更新 token 失败 HTTP " + r.status); return r.json(); });
  }

  function refreshUpstream(id) {
    return fetch("/api/upstreams/" + encodeURIComponent(id) + "/refresh", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" }
    }).then(function (r) { if (!r.ok) throw new Error("刷新上游失败 HTTP " + r.status); return r.json(); });
  }

  function setStatus(text, visible) {
    if (visible) status.textContent = text || "";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function logLine(text, visible) {
    if (!visible) return;
    var logs = document.getElementById("logs");
    if (!logs) return;
    var line = document.createElement("div");
    line.className = "log-line";
    var at = new Date().toLocaleTimeString("zh-CN", { hour12: false });
    line.innerHTML = '<span class="faint">' + at + '</span><span class="log-stage">Token</span><span>' + escapeHtml(text) + '</span>';
    logs.appendChild(line);
    logs.scrollTop = logs.scrollHeight;
  }

  function needsSync(upstream, includeUnknown) {
    var iso = upstream && upstream.tokenExpiresAt;
    if (!iso) return Boolean(includeUnknown);
    var time = new Date(iso).getTime();
    if (Number.isNaN(time)) return Boolean(includeUnknown);
    return (time - Date.now()) <= thresholdMs();
  }

  async function syncTokens(options) {
    options = options || {};
    var visible = !options.quiet;
    var allowOpenWindow = Boolean(options.force);
    if (syncing) {
      setStatus("正在同步...", visible);
      return;
    }
    syncing = true;
    var prevText = button.textContent;
    if (visible) {
      button.disabled = true;
      button.textContent = options.force ? "同步中..." : "检查中...";
    }
    try {
      var cfg = await getConfig();
      var upstreams = (cfg.config && cfg.config.upstreams) || [];
      if (!upstreams.length) {
        setStatus("无上游", visible);
        return;
      }
      var targets = options.force
        ? upstreams.slice()
        : upstreams.filter(function (u) { return needsSync(u, false); });
      if (!targets.length) {
        setStatus("Token 均在有效期内", visible);
        logLine("没有需要同步的上游", visible && options.force);
        return;
      }
      logLine((options.force ? "强制同步 " : "静默检查 ") + targets.length + " 个上游", visible);
      var ok = 0;
      var fail = 0;
      for (var i = 0; i < targets.length; i += 1) {
        var u = targets[i];
        var label = u.name || u.url;
        setStatus("同步 " + (i + 1) + "/" + targets.length + ": " + label, visible);
        try {
          var res = await chrome.runtime.sendMessage({
            type: "READ_AUTH_TOKEN",
            allowOpenWindow: allowOpenWindow,
            upstream: { id: u.id, name: u.name, url: u.url }
          });
          if (!res || !res.ok || !res.token) throw new Error((res && res.error) || "未读取到 auth_token");
          await patchToken(u.id, res.token);
          try { await refreshUpstream(u.id); } catch (error) {}
          ok += 1;
          logLine(label + " token 已更新并刷新", visible);
        } catch (error) {
          fail += 1;
          logLine(label + " 同步失败: " + (error && error.message ? error.message : String(error)), visible);
        }
      }
      setStatus("完成: 成功 " + ok + (fail ? ", 失败 " + fail : ""), visible);
    } catch (error) {
      setStatus("同步失败", visible);
      logLine("同步失败: " + (error && error.message ? error.message : String(error)), visible);
    } finally {
      syncing = false;
      if (visible) {
        button.disabled = false;
        button.textContent = prevText;
      }
    }
  }

  button.addEventListener("click", function () {
    syncTokens({ force: true, quiet: false });
  });

  placeButton();
  new MutationObserver(placeButton).observe(document.documentElement, { childList: true, subtree: true });

  // Silent startup: do not open upstream pages, do not change the UI, only reuse already-open logged-in tabs.
  setTimeout(function () { syncTokens({ quiet: true }); }, 6000);
  setInterval(function () { syncTokens({ quiet: true }); }, AUTO_SYNC_INTERVAL_MS);
})();
