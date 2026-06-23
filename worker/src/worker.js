const APP_HTML = String.raw`<!doctype html>
<html lang="zh-CN" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark light">
  <title>上游倍率监控</title>
  <style>
    *,*::before,*::after{box-sizing:border-box}
    :root{
      --bg:#0b1110; --bg-soft:#0f1716; --panel:#121d1b; --panel-2:#15211f; --elev:#18272400;
      --line:rgba(155,200,188,.13); --line-2:rgba(155,200,188,.22);
      --txt:#e9f4f0; --txt-dim:#9fb4ad; --txt-faint:#728079;
      --acc:#34d399; --acc-2:#2dd4bf; --acc-ink:#04140e;
      --good:#34d399; --warn:#f4b740; --danger:#f87171; --info:#60a5fa; --used:#a78bfa;
      --radius:14px; --radius-sm:9px; --shadow:0 18px 40px -24px rgba(0,0,0,.7);
      --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;
      --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;
    }
    html[data-theme="light"]{
      --bg:#eef3f1; --bg-soft:#e7eeeb; --panel:#ffffff; --panel-2:#f6faf8;
      --line:rgba(20,60,50,.12); --line-2:rgba(20,60,50,.2);
      --txt:#0e1f1a; --txt-dim:#4a615a; --txt-faint:#7c8d86;
      --acc:#0f9d6b; --acc-2:#0d9488; --acc-ink:#ffffff;
      --shadow:0 18px 36px -26px rgba(8,40,30,.45);
    }
    html,body{margin:0;height:100%}
    body{
      font-family:var(--sans); color:var(--txt); background:var(--bg);
      font-size:14px; line-height:1.5; -webkit-font-smoothing:antialiased; overflow:hidden;
    }
    #bg{position:fixed;inset:0;z-index:-1;background:
      radial-gradient(900px 600px at 12% -8%, rgba(52,211,153,.10), transparent 60%),
      radial-gradient(800px 600px at 100% 0%, rgba(45,212,191,.08), transparent 55%),
      radial-gradient(700px 700px at 50% 120%, rgba(96,165,250,.06), transparent 60%),
      var(--bg);}
    .hidden{display:none !important}
    a{color:var(--acc-2);text-decoration:none}
    a:hover{text-decoration:underline}
    ::-webkit-scrollbar{width:10px;height:10px}
    ::-webkit-scrollbar-thumb{background:var(--line-2);border-radius:20px;border:2px solid transparent;background-clip:padding-box}
    ::-webkit-scrollbar-thumb:hover{background:var(--txt-faint)}

    /* ---------- buttons / inputs ---------- */
    .btn{appearance:none;cursor:pointer;font:inherit;font-weight:650;color:var(--txt);
      background:var(--panel-2);border:1px solid var(--line-2);border-radius:var(--radius-sm);
      padding:8px 14px;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;
      transition:.15s ease;min-height:38px}
    .btn:hover{border-color:var(--acc);color:#fff}
    html[data-theme="light"] .btn:hover{color:var(--acc-ink)}
    .btn:active{transform:translateY(1px)}
    .btn:disabled{opacity:.45;cursor:not-allowed;transform:none}
    .btn.primary{background:linear-gradient(180deg,var(--acc),var(--acc-2));color:var(--acc-ink);border-color:transparent;font-weight:760}
    .btn.primary:hover{filter:brightness(1.07);color:var(--acc-ink)}
    .btn.small{padding:5px 10px;min-height:30px;font-size:12.5px;border-radius:7px}
    .btn.ghost{background:transparent}
    .btn.warn{border-color:rgba(248,113,113,.4);color:#fca5a5}
    .btn.warn:hover{border-color:var(--danger);color:#fff}
    .btn.icon{padding:8px;min-width:38px;justify-content:center}
    .btn.pulse{animation:pulse 1s ease infinite}
    @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,.4)}50%{box-shadow:0 0 0 6px rgba(52,211,153,0)}}
    input,select,textarea{font:inherit;color:var(--txt);background:var(--bg-soft);
      border:1px solid var(--line-2);border-radius:var(--radius-sm);padding:9px 11px;width:100%;transition:.15s}
    input:focus,select:focus,textarea:focus{outline:none;border-color:var(--acc);box-shadow:0 0 0 3px rgba(52,211,153,.14)}
    textarea{resize:vertical;font-family:var(--mono);font-size:12.5px;line-height:1.55}
    label.field{display:block;margin-bottom:10px}
    label.field>span{display:block;font-size:11.5px;color:var(--txt-dim);margin-bottom:5px;font-weight:600;letter-spacing:.02em}
    .field-hint{margin:-4px 0 10px;font-size:11.5px;color:var(--txt-faint);line-height:1.45}
    .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}

    /* ---------- badges ---------- */
    .badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:650;
      padding:2px 8px;border-radius:999px;background:var(--line);color:var(--txt-dim);border:1px solid transparent;white-space:nowrap}
    .badge.good{background:rgba(52,211,153,.15);color:var(--good)}
    .badge.warn{background:rgba(244,183,64,.15);color:var(--warn)}
    .badge.danger{background:rgba(248,113,113,.16);color:var(--danger)}
    .badge.info{background:rgba(96,165,250,.16);color:var(--info)}
    .badge.used{background:rgba(167,139,250,.16);color:var(--used)}
    .token-badge{display:inline-flex;align-items:center;font-size:10.5px;font-weight:700;padding:1px 7px;border-radius:999px;margin-left:6px}
    .token-badge.expired{background:rgba(248,113,113,.18);color:var(--danger)}
    .token-badge.warn{background:rgba(244,183,64,.18);color:var(--warn)}
    .platform-tag{display:inline-flex;font-size:11px;font-weight:650;padding:2px 9px;border-radius:7px;background:var(--line);color:var(--txt-dim);text-transform:capitalize}
    .platform-tag.openai{background:rgba(16,185,129,.16);color:#34d399}
    .platform-tag.anthropic{background:rgba(217,119,87,.18);color:#e8a07f}
    .platform-tag.gemini{background:rgba(96,165,250,.16);color:#7cb0fb}
    .platform-tag.antigravity{background:rgba(167,139,250,.16);color:#b9a3fb}
    .platform-tag.xai{background:rgba(148,163,184,.18);color:#cbd5e1}
    .platform-tag.azure{background:rgba(45,212,191,.16);color:#5eead4}
    .rate{font-family:var(--mono);font-weight:700;color:var(--txt)}
    .rate-stack{display:inline-flex;align-items:baseline;gap:6px}
    .rate-old{font-family:var(--mono);font-size:11px;color:var(--txt-faint);text-decoration:line-through}
    .rate-source{font-size:10px;color:var(--warn);font-weight:700}
    .balance-chip{display:inline-flex;align-items:center;font-family:var(--mono);font-weight:700;font-size:12px;padding:2px 9px;border-radius:999px;background:var(--line);color:var(--txt-dim)}
    .balance-chip.ok{background:rgba(52,211,153,.15);color:var(--good)}
    .balance-chip.low{background:rgba(244,183,64,.16);color:var(--warn)}
    .balance-chip.depleted{background:rgba(248,113,113,.16);color:var(--danger)}
    .balance-chip.error{background:rgba(248,113,113,.16);color:var(--danger)}
    .balance-chip.muted{opacity:.7}
    .faint{color:var(--txt-faint)}
    .muted{color:var(--txt-dim)}

    /* ---------- login ---------- */
    .login-screen{position:fixed;inset:0;display:grid;place-items:center;padding:24px}
    .login-card{width:min(380px,92vw);background:var(--panel);border:1px solid var(--line-2);border-radius:20px;padding:30px 28px;box-shadow:var(--shadow)}
    .login-card h1{font-size:20px;margin:0 0 4px}
    .login-card .sub{color:var(--txt-dim);font-size:13px;margin-bottom:22px}
    .login-card .field{margin-bottom:14px}
    .login-err{color:var(--danger);font-size:12.5px;min-height:18px;margin-top:6px}
    .brand-dot{width:11px;height:11px;border-radius:50%;background:linear-gradient(180deg,var(--acc),var(--acc-2));display:inline-block;box-shadow:0 0 14px var(--acc)}

    /* ---------- app shell ---------- */
    .app{display:flex;flex-direction:column;height:100vh}
    .topbar{display:flex;align-items:center;gap:16px;padding:12px 20px;background:var(--panel);border-bottom:1px solid var(--line);flex-wrap:wrap}
    .brand{display:flex;align-items:center;gap:10px;font-weight:760;font-size:15px;letter-spacing:.01em}
    .metrics{display:flex;gap:8px;flex-wrap:wrap}
    .metric{display:flex;flex-direction:column;background:var(--bg-soft);border:1px solid var(--line);border-radius:11px;padding:6px 13px;min-width:74px}
    .metric b{font-size:18px;font-weight:780;line-height:1.1;font-variant-numeric:tabular-nums}
    .metric span{font-size:10.5px;color:var(--txt-dim);margin-top:1px}
    .metric.alert b{color:var(--warn)}
    .top-actions{display:flex;align-items:center;gap:9px;margin-left:auto;flex-wrap:wrap}
    .auto-refresh{display:inline-flex;align-items:center;gap:7px;background:var(--bg-soft);border:1px solid var(--line-2);border-radius:var(--radius-sm);padding:5px 10px;min-height:38px;font-size:12.5px;cursor:pointer}
    .auto-refresh.on{border-color:var(--acc)}
    .auto-refresh input{width:auto}
    .auto-select{width:auto;padding:3px 6px;min-height:26px;background:var(--panel)}
    .auto-count{font-family:var(--mono);font-size:12px;color:var(--acc);min-width:30px;text-align:right}
    .switch{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;color:var(--txt-dim);cursor:pointer;user-select:none}
    .switch input{width:auto}

    .layout{flex:1;display:grid;grid-template-columns:320px minmax(0,1fr) 340px;gap:14px;padding:14px;overflow:hidden}
    .col{display:flex;flex-direction:column;gap:14px;overflow:auto;padding-right:2px}
    .col-center{overflow:hidden}
    .card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:16px;box-shadow:var(--shadow)}
    .card.flush{padding:0;overflow:hidden}
    .card h2{font-size:13px;font-weight:720;margin:0 0 13px;display:flex;align-items:center;gap:8px;letter-spacing:.01em}
    .card h2 .tag{font-size:10.5px;font-weight:650;color:var(--txt-faint);background:var(--line);padding:2px 7px;border-radius:6px}
    .card h2 .right{margin-left:auto;display:flex;gap:6px}

    /* upstream tabs */
    .tabs{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}
    .tab{display:inline-flex;align-items:center;gap:7px;background:var(--bg-soft);border:1px solid var(--line-2);border-radius:11px;padding:8px 12px;cursor:pointer;white-space:nowrap;transition:.15s;color:var(--txt-dim);font-weight:600}
    .tab:hover{border-color:var(--acc);color:var(--txt)}
    .tab.active{border-color:var(--acc);background:linear-gradient(180deg,rgba(52,211,153,.14),transparent);color:var(--txt)}
    .tab .dot{width:7px;height:7px;border-radius:50%;background:var(--txt-faint)}
    .tab.active .dot{background:var(--acc);box-shadow:0 0 8px var(--acc)}
    .tab.marked .tab-name{color:var(--acc-2)}
    .tab-mark{font-size:10.5px;background:rgba(45,212,191,.16);color:var(--acc-2);padding:1px 6px;border-radius:6px}
    .upstream-toolbar{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}

    .status-line{margin-top:12px;padding:10px 13px;background:var(--bg-soft);border:1px solid var(--line);border-radius:10px;font-size:12.5px;color:var(--txt-dim);min-height:40px;display:flex;align-items:center;flex-wrap:wrap;gap:8px}
    .status-line.fail{border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.06)}
    .status-actions{display:inline-flex;gap:8px;align-items:center;margin-left:auto}

    .progress{margin-top:12px;background:var(--bg-soft);border:1px solid var(--line);border-radius:10px;padding:11px 13px}
    .progress-head{display:flex;justify-content:space-between;font-size:12px;margin-bottom:7px}
    .progress-bar{height:7px;background:var(--line);border-radius:99px;overflow:hidden}
    .progress-fill{height:100%;width:0;background:linear-gradient(90deg,var(--acc),var(--acc-2));border-radius:99px;transition:width .25s}
    .progress-foot{font-size:11.5px;color:var(--txt-faint);margin-top:6px}

    /* table */
    .table-wrap{flex:1;overflow:auto;border-top:1px solid var(--line)}
    table{width:100%;border-collapse:collapse;font-size:13px}
    thead th{position:sticky;top:0;background:var(--panel-2);text-align:left;font-size:11px;color:var(--txt-dim);font-weight:650;padding:10px 12px;border-bottom:1px solid var(--line);white-space:nowrap;z-index:1}
    tbody td{padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:middle}
    tbody tr:hover{background:var(--bg-soft)}
    tbody tr.selected{background:rgba(52,211,153,.08);box-shadow:inset 3px 0 0 var(--acc)}
    tbody tr.group-used{opacity:.62}
    .group-name strong{font-weight:680}
    .group-meta{display:flex;gap:6px;align-items:center;margin-top:3px;flex-wrap:wrap}
    .group-note{font-size:11px;color:var(--txt-faint);max-width:230px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block}
    .select-actions{display:flex;gap:6px}
    .sort-head{background:none;border:none;color:inherit;font:inherit;cursor:pointer;display:inline-flex;gap:4px;align-items:center;padding:0}
    .sort-arrow{color:var(--acc)}
    .empty{padding:40px 16px;text-align:center;color:var(--txt-faint)}

    /* balances */
    .balance-row{display:flex;align-items:center;gap:10px;padding:10px 11px;border:1px solid var(--line);border-radius:11px;margin-bottom:8px;cursor:pointer;transition:.15s;background:var(--bg-soft)}
    .balance-row:hover{border-color:var(--line-2)}
    .balance-row.active{border-color:var(--acc);background:linear-gradient(180deg,rgba(52,211,153,.1),transparent)}
    .balance-main{flex:1;min-width:0}
    .balance-title{display:flex;align-items:center;gap:6px;font-weight:650}
    .balance-title strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .balance-meta{font-size:11px;margin-top:2px}
    .balance-url{color:var(--txt-faint)}
    .balance-side{display:flex;flex-direction:column;align-items:flex-end;gap:3px}
    .balance-time{font-size:10.5px;color:var(--txt-faint);font-family:var(--mono)}

    /* selected info / local groups */
    .selected-info{font-size:13px;line-height:1.7}
    .selected-info .empty{padding:20px 0}
    .check-list{display:flex;flex-direction:column;gap:6px;max-height:240px;overflow:auto;margin:4px 0 12px}
    .check-row{display:flex;align-items:center;gap:9px;padding:7px 10px;border:1px solid var(--line);border-radius:9px;cursor:pointer;font-size:13px}
    .check-row:hover{border-color:var(--line-2)}
    .check-row input{width:auto}
    .check-row span:first-of-type{flex:1}

    /* logs */
    .logs{font-family:var(--mono);font-size:11.5px;line-height:1.7;max-height:180px;overflow:auto;background:var(--bg-soft);border:1px solid var(--line);border-radius:10px;padding:9px 11px}
    .log-line{display:flex;gap:9px;padding:1px 0}
    .log-stage{color:var(--acc-2);font-weight:700;min-width:34px}
    .status-link{font-weight:600}

    /* history dock */
    .dock{position:fixed;top:0;right:0;height:100vh;width:min(460px,94vw);background:var(--panel);border-left:1px solid var(--line-2);box-shadow:-20px 0 60px -30px rgba(0,0,0,.8);z-index:40;display:flex;flex-direction:column;animation:slideIn .22s ease}
    @keyframes slideIn{from{transform:translateX(30px);opacity:0}to{transform:none;opacity:1}}
    .dock-head{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid var(--line)}
    .dock-head h2{font-size:15px;margin:0;flex:1}
    .dock-body{flex:1;overflow:auto;padding:14px 18px}
    .history-row{display:grid;grid-template-columns:128px 1fr auto;gap:8px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line);font-size:12.5px}
    .history-row .h-time{font-family:var(--mono);font-size:11px;color:var(--txt-faint)}
    .history-row .h-up{color:var(--acc-2);font-weight:600}
    .history-row .h-group{grid-column:2;color:var(--txt-dim);font-size:11.5px}
    .h-change{grid-column:3;grid-row:1/3;display:flex;align-items:center;gap:6px;font-family:var(--mono);font-weight:700}
    .h-old{color:var(--txt-faint);text-decoration:line-through;font-size:11px}
    .h-arrow{color:var(--txt-faint)}
    .h-new{color:var(--warn)}
    .history-empty{padding:40px 10px;text-align:center;color:var(--txt-faint);font-size:12.5px}
    .scrim{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:39}

    /* responsive */
    @media (max-width:1180px){
      .layout{grid-template-columns:300px minmax(0,1fr);grid-template-rows:auto;}
      .col-right{grid-column:1 / -1;flex-direction:row;flex-wrap:wrap}
      .col-right .card{flex:1;min-width:280px}
    }
    @media (max-width:820px){
      body{overflow:auto}
      .app{height:auto;min-height:100vh}
      .layout{grid-template-columns:1fr;overflow:visible;height:auto}
      .col{overflow:visible}
      .col-center{overflow:visible}
      .table-wrap{overflow-x:auto}
      .topbar{position:sticky;top:0;z-index:30}
      .metrics{order:3;width:100%}
      .top-actions{margin-left:0}
    }
  </style>
</head>
<body>
  <div id="bg"></div>

  <!-- ===== login ===== -->
  <section id="loginScreen" class="login-screen hidden">
    <div class="login-card">
      <h1><span class="brand-dot"></span> 上游倍率监控</h1>
      <div class="sub">请登录以管理上游与分组</div>
      <label class="field"><span>账号</span><input id="loginUser" autocomplete="username" placeholder="管理员账号"></label>
      <label class="field"><span>密码</span><input id="loginPass" type="password" autocomplete="current-password" placeholder="管理员密码"></label>
      <button id="loginBtn" class="btn primary" style="width:100%;justify-content:center">登录</button>
      <div id="loginError" class="login-err"></div>
    </div>
  </section>

  <!-- ===== app ===== -->
  <div id="appScreen" class="app hidden">
    <header class="topbar">
      <div class="brand"><span class="brand-dot"></span> 上游倍率监控</div>
      <div class="metrics">
        <div class="metric"><b id="metricUpstreams">0</b><span>上游数量</span></div>
        <div class="metric"><b id="metricGroups">0</b><span>可见分组</span></div>
        <div class="metric"><b id="metricChanges">0</b><span>变化记录</span></div>
        <div class="metric"><b id="metricHidden">0</b><span>隐藏分组</span></div>
        <div class="metric alert"><b id="metricExpiring">0</b><span>token 待续</span></div>
      </div>
      <div class="top-actions">
        <label class="switch" title="在分组表中显示已隐藏分组"><input type="checkbox" id="showHidden"> 显示隐藏</label>
        <label class="auto-refresh" id="autoRefreshBox" title="按间隔自动刷新全部">
          <input type="checkbox" id="autoRefreshToggle"> 自动
          <select id="autoRefreshInterval" class="auto-select">
            <option value="30">30s</option><option value="60" selected>60s</option>
            <option value="120">2m</option><option value="300">5m</option><option value="600">10m</option>
          </select>
          <span id="autoRefreshCountdown" class="auto-count"></span>
        </label>
        <button id="refreshBtn" class="btn primary">刷新全部</button>
        <button id="historyBtn" class="btn">历史</button>
        <button id="themeBtn" class="btn icon" title="切换主题">◐</button>
        <button id="logoutBtn" class="btn ghost">退出</button>
      </div>
    </header>

    <main class="layout">
      <!-- left -->
      <div class="col col-left">
        <div class="card">
          <h2>上游余额 <span class="tag">点选切换</span><span class="right"><button id="refreshBalancesBtn" class="btn small ghost" title="刷新全部">同步</button></span></h2>
          <div id="balanceList"></div>
        </div>
        <div class="card">
          <h2>添加上游</h2>
          <label class="field"><span>名称</span><input id="upstreamName" placeholder="可留空，自动用域名"></label>
          <label class="field"><span>上游 URL</span><input id="upstreamUrl" placeholder="https://api.example.com"></label>
          <label class="field"><span>auth_token</span><input id="upstreamToken" placeholder="从中转站 localStorage 获取"></label>
          <button id="addUpstreamBtn" class="btn primary" style="width:100%;justify-content:center">保存上游</button>
        </div>
        <div class="card">
          <h2>sub2api 服务器 <span class="right"><span id="adminKeyState" class="badge">未保存</span></span></h2>
          <label class="field"><span>base_url</span><input id="sub2apiBaseUrl" placeholder="https://your-sub2api.com"></label>
          <label class="field"><span>管理员 API Key（留空保持已存）</span><input id="sub2apiAdminKey" type="password" placeholder="••••••"></label>
          <button id="saveServerBtn" class="btn" style="width:100%;justify-content:center">保存服务器</button>
        </div>
      </div>

      <!-- center -->
      <div class="col col-center card flush" style="display:flex;flex-direction:column">
        <div style="padding:14px 16px 0">
          <div class="tabs" id="upstreamTabs"></div>
          <div class="upstream-toolbar">
            <button id="markUpstreamBtn" class="btn small">添加/修改标记</button>
            <button id="clearMarkBtn" class="btn small ghost">取消标记</button>
            <button id="renameUpstreamBtn" class="btn small">重命名</button>
            <button id="updateTokenBtn" class="btn small">更新 token</button>
            <button id="deleteUpstreamBtn" class="btn small warn">删除当前上游</button>
          </div>
          <div id="statusLine" class="status-line"></div>
          <div id="refreshProgress" class="progress hidden">
            <div class="progress-head"><span id="progressTitle">刷新上游</span><span id="progressPercent">0%</span></div>
            <div class="progress-bar"><div id="progressFill" class="progress-fill"></div></div>
            <div id="progressFoot" class="progress-foot"><span id="progressCurrent"></span> · <span id="progressCount"></span></div>
          </div>
        </div>
        <div class="table-wrap" id="tableHost" style="margin-top:12px"></div>
        <div style="padding:12px 16px;border-top:1px solid var(--line)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">
            <strong style="font-size:12px;color:var(--txt-dim)">运行日志</strong>
            <button id="clearLogsBtn" class="btn small ghost" style="margin-left:auto">清空</button>
          </div>
          <div id="logs" class="logs"></div>
        </div>
      </div>

      <!-- right -->
      <div class="col col-right">
        <div class="card">
          <h2>当前选择</h2>
          <div id="selectedInfo" class="selected-info"><div class="empty">请选择一个上游分组</div></div>
        </div>
        <div class="card">
          <h2>创建参数 <span class="tag">创建 key 时使用</span></h2>
          <div class="row2">
            <label class="field"><span>create_count</span><input id="setCreateCount" type="number" min="1"></label>
            <label class="field"><span>priority</span><input id="setPriority" type="number"></label>
          </div>
          <div class="row2">
            <label class="field"><span>concurrency</span><input id="setConcurrency" type="number"></label>
            <label class="field"><span>load_factor</span><input id="setLoadFactor" type="number"></label>
          </div>
          <div class="row2">
            <label class="field"><span>platform</span><input id="setPlatform"></label>
            <label class="field"><span>type</span><input id="setType"></label>
          </div>
          <label class="field"><span>base_url（留空用上游 URL）</span><input id="setBaseUrl"></label>
          <div class="row2">
            <label class="field"><span>rate_multiplier_mode</span>
              <select id="setRateMode"><option value="upstream">upstream（按上游倍率）</option><option value="manual">manual（手动）</option></select>
            </label>
            <label class="field"><span>rate_multiplier（手动模式）</span><input id="setRateMultiplier" placeholder="手动模式生效"></label>
          </div>
          <label class="field"><span>model_mapping</span><textarea id="setModelMapping" rows="5"></textarea></label>
          <div id="modelMappingHint" class="field-hint">OpenAI 平台会按这里的模型映射导入。</div>
          <label class="field"><span>notes</span><input id="setNotes" placeholder="备注"></label>
          <button id="saveDefaultsBtn" class="btn" style="width:100%;justify-content:center">保存参数</button>
        </div>
        <div class="card">
          <h2>导入到本地分组 <span class="right"><button id="loadLocalGroupsBtn" class="btn small">读取本地分组</button></span></h2>
          <div id="localGroupPicker" class="check-list"><div class="muted" style="padding:8px">尚未读取本地分组</div></div>
          <div style="display:flex;gap:8px">
            <button id="createImportBtn" class="btn primary" style="flex:1;justify-content:center">创建并导入</button>
            <button id="clearSelectionBtn" class="btn ghost">清空选择</button>
            <button id="fixLocalPlatformBtn" class="btn warn" title="方案 3 上线后启用；当前按方案 1 由数据库直接修正" disabled>修正平台</button>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- history dock -->
  <div id="historyScrim" class="scrim hidden"></div>
  <aside id="historyDock" class="dock hidden">
    <div class="dock-head">
      <h2>倍率变化历史</h2>
      <button id="refreshHistoryBtn" class="btn small">刷新</button>
      <button id="clearHistoryBtn" class="btn small warn">清空</button>
      <button id="closeHistoryBtn" class="btn small ghost">关闭</button>
    </div>
    <div class="dock-body"><div id="historyList"></div></div>
  </aside>

  <script>
  (function () {
    "use strict";
    var state = {
      config: null, selectedUpstreamId: "", selectedGroupId: "",
      localGroups: [], localGroupIds: [], rateSortDir: "asc",
      busy: false, autoTimer: null, autoRemaining: 0, historyOpen: false
    };

    function byId(id){ return document.getElementById(id); }
    function esc(v){ return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
    function escAttr(v){ return esc(v).replace(/\x60/g,"&#96;"); }
    function setValue(id,v){ var el=byId(id); if(el) el.value = v==null?"":v; }

    function dashboardUrl(value){
      try{ var u=new URL(value); u.pathname="/dashboard"; u.search=""; u.hash=""; return u.toString().replace(/\/$/,""); }
      catch(e){ return value; }
    }
    function displayHost(value){ try{ return new URL(value).host; }catch(e){ return value; } }
    function formatTime(iso){ if(!iso) return "-"; var d=new Date(iso); if(isNaN(d.getTime())) return "-"; return d.toLocaleString("zh-CN",{hour12:false}); }
    function shortTime(iso){ if(!iso) return ""; var d=new Date(iso); if(isNaN(d.getTime())) return ""; return d.toLocaleTimeString("zh-CN",{hour12:false}); }
    function formatMoney(v){ var n=Number(v); return Number.isFinite(n)? "$"+n.toFixed(2) : "-"; }
    function parseJwtMeta(token){
      var parts=String(token||"").split("."); if(parts.length<2) return {expired:false};
      try{
        var b=parts[1].replace(/-/g,"+").replace(/_/g,"/"); while(b.length%4) b+="=";
        var payload=JSON.parse(decodeURIComponent(Array.prototype.map.call(atob(b),function(ch){return "%"+("00"+ch.charCodeAt(0).toString(16)).slice(-2);}).join("")));
        var exp=Number(payload.exp); if(!Number.isFinite(exp)) return {expired:false};
        return {expired: exp<=Math.floor(Date.now()/1000), expiresAt:new Date(exp*1000).toISOString()};
      }catch(e){ return {expired:false}; }
    }

    /* ---------- api ---------- */
    async function api(path, options){
      options=options||{};
      var opt={ method:options.method||"GET", headers:{"content-type":"application/json"}, credentials:"same-origin" };
      if(options.body) opt.body=JSON.stringify(options.body);
      var res=await fetch(path,opt);
      var data=null; try{ data=await res.json(); }catch(e){ data={}; }
      if(!res.ok){
        if(res.status===401 && !options.allow401) showLogin();
        var msg=data.error||data.message||("HTTP "+res.status);
        if(!options.silent) addLog("错误",msg);
        throw new Error(msg);
      }
      return data;
    }

    /* ---------- logging ---------- */
    function addLog(stage,message){ addLogHtml(stage, esc(message)); }
    function addLogHtml(stage,html){
      var host=byId("logs"); if(!host) return;
      var line=document.createElement("div"); line.className="log-line";
      line.innerHTML='<span class="faint">'+esc(new Date().toLocaleTimeString("zh-CN",{hour12:false}))+'</span><span class="log-stage">'+esc(stage)+'</span><span>'+html+'</span>';
      host.appendChild(line); host.scrollTop=host.scrollHeight;
    }

    /* ---------- status / progress ---------- */
    function setStatus(text){ var el=byId("statusLine"); el.classList.remove("fail"); el.textContent=text||""; }
    function setStatusHtml(html){ byId("statusLine").innerHTML=html||""; }
    function setProgress(o){
      o=o||{}; var box=byId("refreshProgress"); if(!box) return;
      if(!o.active){ box.classList.add("hidden"); return; }
      var total=Math.max(0,Number(o.total)||0), done=Math.max(0,Math.min(total,Number(o.done)||0));
      var pct=total?Math.round(done/total*100):0;
      box.classList.remove("hidden");
      byId("progressTitle").textContent=o.title||"刷新上游";
      byId("progressPercent").textContent=pct+"%";
      byId("progressFill").style.width=pct+"%";
      byId("progressCurrent").textContent=o.current||"";
      byId("progressCount").textContent=done+" / "+total+"  成功 "+(o.ok||0)+"，失败 "+(o.fail||0);
    }

    /* ---------- badges ---------- */
    function statusBadge(s){ var raw=s||"-"; var k=raw==="active"?"good":raw==="inactive"?"warn":""; return '<span class="badge '+k+'">'+esc(raw)+'</span>'; }
    function platformKind(p){ var n=String(p||"-").toLowerCase().replace(/[^a-z0-9]+/g,""); var known=["openai","anthropic","gemini","antigravity","azure","xai"]; return known.indexOf(n)!==-1?n:"other"; }
    function platformBadge(p){ var raw=String(p||"-").trim()||"-"; return '<span class="platform-tag '+platformKind(raw)+'">'+esc(raw)+'</span>'; }
    function rateComparable(v){ var raw=String(v==null?"":v).replace(/[×x]/gi,"").trim(); var n=Number(raw); return Number.isFinite(n)?String(n):raw; }
    function rateNumber(v){ var raw=String(v==null?"":v).replace(/[×x]/gi,"").trim(); var n=Number(raw); return Number.isFinite(n)?n:Number.POSITIVE_INFINITY; }
    function rateHtml(g){
      var eff=g.effective_rate_multiplier||g.rate_multiplier||""; var base=g.base_rate_multiplier||"";
      if(base && eff && rateComparable(base)!==rateComparable(eff)){
        return '<span class="rate-stack" title="基础 ×'+escAttr(base)+'，实际 ×'+escAttr(eff)+'"><span class="rate-old">×'+esc(base)+'</span><span class="rate">×'+esc(eff)+'</span><span class="rate-source">实际</span></span>';
      }
      return '<span class="rate">×'+esc(eff||"未知")+'</span>';
    }
    function balanceLevel(v){ var n=Number(v); if(!Number.isFinite(n)) return "muted"; if(n<1) return "depleted"; if(n<5) return "low"; return "ok"; }
    function balanceBadge(b,compact){
      if(!b) return '<span class="balance-chip muted">'+(compact?"-":"余额 -")+'</span>';
      if(b.error) return '<span class="balance-chip error" title="'+escAttr(b.error)+'">'+(compact?"!":"余额失败")+'</span>';
      var n=Number(b.balance); if(!Number.isFinite(n)) return '<span class="balance-chip muted">'+(compact?"-":"余额 -")+'</span>';
      return '<span class="balance-chip '+balanceLevel(n)+'" title="最近刷新：'+escAttr(formatTime(b.refreshedAt))+'">'+(compact?"":"余额 ")+esc(formatMoney(n))+'</span>';
    }
    function tokenExpiryBadge(u){
      var iso=u&&u.tokenExpiresAt; if(!iso) return ""; var t=new Date(iso).getTime(); if(Number.isNaN(t)) return "";
      var now=Date.now();
      if(t<=now) return '<span class="token-badge expired" title="auth_token 已过期：'+escAttr(formatTime(iso))+'">已过期</span>';
      var days=Math.floor((t-now)/86400000);
      if(days<=3) return '<span class="token-badge warn" title="将于 '+escAttr(formatTime(iso))+' 过期">'+(days<=0?"今日到期":days+"天后过期")+'</span>';
      return "";
    }
    function isExpiringSoon(u){
      var iso=u&&u.tokenExpiresAt; if(!iso) return false; var t=new Date(iso).getTime(); if(Number.isNaN(t)) return false;
      return t - Date.now() <= 3*86400000;
    }

    /* ---------- selectors ---------- */
    function currentUpstream(){ var us=(state.config&&state.config.upstreams)||[]; return us.find(function(i){return i.id===state.selectedUpstreamId;})||us[0]||null; }
    function currentGroup(){ var u=currentUpstream(); if(!u||!u.snapshot) return null; return (u.snapshot.groups||[]).find(function(g){return String(g.id)===String(state.selectedGroupId);})||null; }
    function selectedGroupPlatform(){ var g=currentGroup(); return String((g&&g.platform)||"").trim(); }
    function selectedLocalGroups(){ return (state.localGroups||[]).filter(function(g){return state.localGroupIds.indexOf(Number(g.id))!==-1;}); }
    function selectedLocalGroupPlatforms(){
      var uniq=[]; selectedLocalGroups().forEach(function(g){
        var p=String(g.platform||"").trim(); if(p&&uniq.indexOf(p)===-1) uniq.push(p);
      });
      return uniq;
    }
    function selectedLocalGroupPlatform(){
      var uniq=selectedLocalGroupPlatforms();
      return uniq.length===1?uniq[0]:"";
    }
    function formPlatform(){ var el=byId("setPlatform"); return String((el&&el.value)||"").trim(); }
    function desiredAccountPlatform(){ return formPlatform()||selectedGroupPlatform()||selectedLocalGroupPlatform(); }
    function syncModelMappingHint(){
      var el=byId("modelMappingHint"); if(!el) return;
      var p=String(desiredAccountPlatform()||"openai").toLowerCase();
      el.textContent=p==="openai"?"OpenAI 平台会按这里的模型映射导入。":"当前平台为 "+p+"，导入时只会保留匹配该平台的 model_mapping。";
    }
    function syncSelectedGroupPlatform(){ var p=selectedGroupPlatform()||selectedLocalGroupPlatform(); var el=byId("setPlatform"); if(p&&el&&el.value!==p) el.value=p; syncModelMappingHint(); }
    function changeMap(u){
      var ch=(u.snapshot&&u.snapshot.changes)||{}; var m={};
      (ch.added||[]).forEach(function(id){ m[String(id)]="新增"; });
      (ch.changed||[]).forEach(function(it){ m[String(it.id)]= it.fields&&it.fields.rate_multiplier?"倍率变化":"已变化"; });
      return m;
    }

    /* ---------- render ---------- */
    function renderAll(){
      if(!state.config) return;
      renderMetrics(); renderTabs(); renderBalances(); renderTable(); renderSelected(); renderLocalGroups();
    }
    function renderMetrics(){
      var us=state.config.upstreams||[]; var showHidden=byId("showHidden").checked;
      var gc=0,hidden=0,changes=0,expiring=0;
      us.forEach(function(u){
        var hs=new Set(u.hiddenGroupIds||[]); hidden+=hs.size;
        var gs=(u.snapshot&&u.snapshot.groups)||[];
        gc+=gs.filter(function(g){return showHidden||!hs.has(String(g.id));}).length;
        var c=u.snapshot&&u.snapshot.changes; if(c) changes+=(c.added||[]).length+(c.removed||[]).length+(c.changed||[]).length;
        if(isExpiringSoon(u)) expiring+=1;
      });
      byId("metricUpstreams").textContent=us.length;
      byId("metricGroups").textContent=gc;
      byId("metricChanges").textContent=changes;
      byId("metricHidden").textContent=hidden;
      byId("metricExpiring").textContent=expiring;
    }
    function renderTabs(){
      var host=byId("upstreamTabs"); var us=state.config.upstreams||[];
      var sel=currentUpstream();
      ["markUpstreamBtn","renameUpstreamBtn","updateTokenBtn","deleteUpstreamBtn"].forEach(function(id){ var b=byId(id); if(b) b.disabled=!us.length; });
      var cm=byId("clearMarkBtn"); if(cm) cm.disabled=!us.length||!(sel&&sel.mark);
      if(!us.length){ host.innerHTML='<span class="muted">还没有上游</span>'; return; }
      host.innerHTML=us.map(function(u){
        var active=u.id===state.selectedUpstreamId?" active":""; var marked=u.mark?" marked":"";
        var count=u.snapshot&&u.snapshot.groups?u.snapshot.groups.length:0;
        var mark=u.mark?'<span class="tab-mark">'+esc(u.mark)+'</span>':"";
        return '<button class="tab'+active+marked+'" data-tab="'+escAttr(u.id)+'"><span class="dot"></span><span class="tab-name">'+esc(u.name||u.url)+'</span>'+mark+tokenExpiryBadge(u)+balanceBadge(u.balance,true)+'<span class="badge">'+count+'</span></button>';
      }).join("");
      host.querySelectorAll("[data-tab]").forEach(function(b){ b.addEventListener("click",function(){ state.selectedUpstreamId=b.getAttribute("data-tab"); state.selectedGroupId=""; renderAll(); }); });
    }
    function renderBalances(){
      var host=byId("balanceList"); if(!host) return; var us=state.config.upstreams||[];
      if(!us.length){ host.innerHTML='<div class="muted">暂无上游</div>'; return; }
      host.innerHTML=us.map(function(u){
        var active=u.id===state.selectedUpstreamId?" active":"";
        var mark=u.mark?'<span class="tab-mark">'+esc(u.mark)+'</span>':"";
        return '<div class="balance-row'+active+'" role="button" tabindex="0" data-balance="'+escAttr(u.id)+'"><span class="balance-main"><span class="balance-title"><strong>'+esc(u.name||u.url)+'</strong>'+mark+tokenExpiryBadge(u)+'</span><span class="balance-meta"><a class="balance-url" href="'+escAttr(dashboardUrl(u.url))+'" target="_blank" rel="noopener noreferrer">'+esc(displayHost(u.url))+'</a></span></span><span class="balance-side">'+balanceBadge(u.balance,true)+'<span class="balance-time">'+esc(shortTime(u.balance&&u.balance.refreshedAt))+'</span></span></div>';
      }).join("");
      host.querySelectorAll("[data-balance]").forEach(function(el){
        el.addEventListener("click",function(){ state.selectedUpstreamId=el.getAttribute("data-balance"); state.selectedGroupId=""; renderAll(); });
      });
      host.querySelectorAll(".balance-url").forEach(function(a){ a.addEventListener("click",function(e){ e.stopPropagation(); }); });
    }
    function failedStatusHtml(u){
      var d=u.snapshot||{}; var expired=d.tokenExpired?' <span class="badge danger">token 已过期</span>':"";
      return '最近刷新失败：'+esc(d.error||"未知错误")+expired+'<span class="status-actions"><a class="status-link" href="'+escAttr(dashboardUrl(u.url))+'" target="_blank" rel="noopener noreferrer">打开中转站</a><button class="btn small" data-update-token-inline>更新 token</button></span>';
    }
    function refreshFailureHtml(u,r){
      r=r||{}; var url=r.dashboardUrl||dashboardUrl(r.upstreamUrl||u.url);
      var expired=r.tokenExpired?' <span class="badge danger">token 已过期</span>':"";
      return esc(u.name||u.url)+' 失败：'+esc(r.error||"未知错误")+expired+' <a class="status-link" href="'+escAttr(url)+'" target="_blank" rel="noopener noreferrer">打开中转站</a>';
    }
    function renderTable(){
      var host=byId("tableHost"); var u=currentUpstream();
      if(!u){ host.innerHTML='<div class="empty">保存上游后开始刷新</div>'; setStatus("等待上游配置"); return; }
      if(u.snapshot&&u.snapshot.error){ byId("statusLine").classList.add("fail"); setStatusHtml(failedStatusHtml(u)); var ib=byId("statusLine").querySelector("[data-update-token-inline]"); if(ib) ib.addEventListener("click",updateCurrentToken); }
      else { byId("statusLine").classList.remove("fail"); setStatusHtml('当前上游：<a class="status-link" href="'+escAttr(dashboardUrl(u.url))+'" target="_blank" rel="noopener noreferrer">'+esc(displayHost(u.url))+'</a> · 余额 '+balanceBadge(u.balance)+tokenExpiryBadge(u)+' · 最近刷新 '+esc(formatTime(u.snapshot&&u.snapshot.refreshedAt))); }
      var hs=new Set(u.hiddenGroupIds||[]); var usedSet=new Set(u.usedGroupIds||[]); var showHidden=byId("showHidden").checked;
      var groups=((u.snapshot&&u.snapshot.groups)||[]).filter(function(g){return showHidden||!hs.has(String(g.id));});
      groups=groups.slice().sort(function(a,b){
        var la=rateNumber(a.rate_multiplier), lb=rateNumber(b.rate_multiplier);
        if(!Number.isFinite(la)&&Number.isFinite(lb)) return 1; if(Number.isFinite(la)&&!Number.isFinite(lb)) return -1;
        var diff=la-lb; if(state.rateSortDir==="desc") diff=-diff;
        return diff||String(a.name||"").localeCompare(String(b.name||""),"zh-CN");
      });
      if(!groups.length){ host.innerHTML='<div class="empty">暂无可见分组</div>'; return; }
      var cm=changeMap(u); var arrow=state.rateSortDir==="asc"?"↑":"↓";
      host.innerHTML='<table><thead><tr><th>选择</th><th>分组</th><th><button class="sort-head" data-sort-rate>倍率 <span class="sort-arrow">'+arrow+'</span></button></th><th>平台</th><th>状态</th><th>类型</th><th>变化</th><th>操作</th></tr></thead><tbody>'+groups.map(function(g){
        var id=String(g.id); var hidden=hs.has(id); var used=usedSet.has(id); var selected=id===String(state.selectedGroupId);
        var ch=cm[id]||""; var chBadge=ch?'<span class="badge '+(ch==="新增"?"good":ch==="倍率变化"?"warn":"info")+'">'+ch+'</span>':'<span class="badge">稳定</span>';
        var rowClass="platform-"+platformKind(g.platform)+(used?" group-used":"")+(selected?" selected":"");
        var note=g.description?'<span class="group-note" title="'+escAttr(g.description)+'">'+esc(g.description)+'</span>':"";
        var usedBtn=used?'<button class="btn small ghost" data-used-clear="'+esc(id)+'">取消</button>':'<button class="btn small" data-used-mark="'+esc(id)+'">标记</button>';
        return '<tr class="'+rowClass+'"><td><div class="select-actions"><button class="btn small" data-select="'+esc(id)+'">选择</button>'+usedBtn+'</div></td><td><div class="group-name"><strong>'+esc(g.name)+'</strong></div><div class="group-meta"><span class="faint">ID '+esc(id)+'</span>'+note+(used?'<span class="badge used">已用</span>':"")+(hidden?'<span class="badge danger">已隐藏</span>':"")+'</div></td><td>'+rateHtml(g)+'</td><td>'+platformBadge(g.platform)+'</td><td>'+statusBadge(g.status)+'</td><td>'+esc(g.subscription_type||"-")+'</td><td>'+chBadge+'</td><td>'+(hidden?'<button class="btn small" data-restore="'+esc(id)+'">恢复</button>':'<button class="btn small warn" data-hide="'+esc(id)+'">删除记录</button>')+'</td></tr>';
      }).join("")+'</tbody></table>';
      host.querySelector("[data-sort-rate]").addEventListener("click",function(){ state.rateSortDir=state.rateSortDir==="asc"?"desc":"asc"; renderTable(); });
      host.querySelectorAll("[data-select]").forEach(function(b){ b.addEventListener("click",function(){ state.selectedGroupId=b.getAttribute("data-select"); renderAll(); }); });
      host.querySelectorAll("[data-hide]").forEach(function(b){ b.addEventListener("click",function(){ hideGroup(b.getAttribute("data-hide")); }); });
      host.querySelectorAll("[data-restore]").forEach(function(b){ b.addEventListener("click",function(){ restoreGroup(b.getAttribute("data-restore")); }); });
      host.querySelectorAll("[data-used-mark]").forEach(function(b){ b.addEventListener("click",function(){ setGroupUsed(b.getAttribute("data-used-mark"),true); }); });
      host.querySelectorAll("[data-used-clear]").forEach(function(b){ b.addEventListener("click",function(){ setGroupUsed(b.getAttribute("data-used-clear"),false); }); });
    }
    function renderSelected(){
      var u=currentUpstream(), g=currentGroup(), host=byId("selectedInfo");
      if(!u||!g){ host.innerHTML='<div class="empty">请选择一个上游分组</div>'; return; }
      syncSelectedGroupPlatform();
      var used=new Set(u.usedGroupIds||[]).has(String(g.id));
      var note=g.description?'<div style="margin-top:6px"><span class="group-note" title="'+escAttr(g.description)+'">'+esc(g.description)+'</span></div>':"";
      host.innerHTML='<div><strong>'+esc(g.name)+'</strong> '+(used?'<span class="badge used">已用</span>':"")+'</div>'+note+'<div class="faint" style="margin-top:6px">上游：'+esc(u.name||u.url)+'</div><div style="margin-top:4px">账号计费倍率：'+rateHtml(g)+'</div><div class="faint">ID '+esc(g.id)+'</div><div style="margin-top:8px">'+platformBadge(g.platform)+'</div>';
    }
    function renderLocalGroups(){
      var host=byId("localGroupPicker");
      if(!state.localGroups.length){ host.innerHTML='<div class="muted" style="padding:8px">尚未读取本地分组</div>'; return; }
      host.innerHTML=state.localGroups.map(function(g){
        var id=Number(g.id); var checked=state.localGroupIds.indexOf(id)!==-1?" checked":"";
        return '<label class="check-row"><input type="checkbox" data-local-group="'+id+'"'+checked+'><span>'+esc(g.name)+'<span class="faint"> #'+id+'</span></span>'+platformBadge(g.platform)+'<span class="badge">×'+esc(g.rate_multiplier==null?"-":g.rate_multiplier)+'</span></label>';
      }).join("");
      host.querySelectorAll("[data-local-group]").forEach(function(inp){
        inp.addEventListener("change",function(){
          var id=Number(inp.getAttribute("data-local-group"));
          if(inp.checked&&state.localGroupIds.indexOf(id)===-1) state.localGroupIds.push(id);
          if(!inp.checked) state.localGroupIds=state.localGroupIds.filter(function(x){return x!==id;});
          syncSelectedGroupPlatform();
        });
      });
    }

    /* ---------- actions: groups ---------- */
    async function hideGroup(id){ var u=currentUpstream(); if(!u) return; addLog("记录","隐藏分组 ID "+id); var r=await api("/api/upstreams/"+encodeURIComponent(u.id)+"/groups/"+encodeURIComponent(id)+"/hide",{method:"POST"}); state.config=r.config; if(state.selectedGroupId===id) state.selectedGroupId=""; renderAll(); }
    async function restoreGroup(id){ var u=currentUpstream(); if(!u) return; addLog("记录","恢复分组 ID "+id); var r=await api("/api/upstreams/"+encodeURIComponent(u.id)+"/groups/"+encodeURIComponent(id)+"/restore",{method:"POST"}); state.config=r.config; renderAll(); }
    async function setGroupUsed(id,used){ var u=currentUpstream(); if(!u) return; addLog("标记",(used?"标记已用":"取消已用")+" 分组 ID "+id); var r=await api("/api/upstreams/"+encodeURIComponent(u.id)+"/groups/"+encodeURIComponent(id)+"/used",{method:used?"POST":"DELETE"}); state.config=r.config; renderAll(); }

    /* ---------- actions: upstream ---------- */
    async function addUpstream(){
      var p={ name:byId("upstreamName").value.trim(), url:byId("upstreamUrl").value.trim(), token:byId("upstreamToken").value.trim() };
      if(!p.url||!p.token){ addLog("校验","请填写上游 URL 和 auth_token"); return; }
      addLog("保存","写入上游配置："+(p.name||p.url));
      var r=await api("/api/upstreams",{method:"POST",body:p}); state.config=r.config;
      state.selectedUpstreamId=state.config.upstreams[state.config.upstreams.length-1].id;
      byId("upstreamName").value=""; byId("upstreamUrl").value=""; byId("upstreamToken").value="";
      renderAll(); await refreshAll();
    }
    async function markCurrentUpstream(){
      var u=currentUpstream(); if(!u) return; var cur=u.mark||""; var next=prompt("添加或修改当前上游标记",cur);
      if(next===null) return; next=next.trim(); if(!next){ addLog("校验","标记不能为空；如需删除请点取消标记"); return; }
      if(next.length>24) next=next.slice(0,24); if(next===cur) return;
      var r=await api("/api/upstreams/"+encodeURIComponent(u.id),{method:"PATCH",body:{mark:next}}); state.config=r.config; renderAll();
    }
    async function clearCurrentMark(){
      var u=currentUpstream(); if(!u||!u.mark) return; if(!confirm("取消当前上游标记「"+u.mark+"」吗？")) return;
      var r=await api("/api/upstreams/"+encodeURIComponent(u.id),{method:"PATCH",body:{mark:""}}); state.config=r.config; renderAll();
    }
    async function renameCurrentUpstream(){
      var u=currentUpstream(); if(!u) return; var cur=u.name||""; var next=prompt("请输入新的上游名称",cur);
      if(next===null) return; next=next.trim(); if(!next){ addLog("校验","名称不能为空"); return; } if(next===cur) return;
      var r=await api("/api/upstreams/"+encodeURIComponent(u.id),{method:"PATCH",body:{name:next}}); state.config=r.config; renderAll();
    }
    async function updateCurrentToken(){
      var u=currentUpstream(); if(!u) return;
      var token=prompt("请打开该上游后台，在控制台执行：\nconsole.log(localStorage.getItem('auth_token'))\n\n把输出粘贴到这里。\n上游："+dashboardUrl(u.url),"");
      if(token===null) return; token=token.trim(); if(!token){ addLog("校验","auth_token 不能为空"); return; }
      if(parseJwtMeta(token).expired){ addLog("校验","这个 auth_token 已过期"); alert("这个 auth_token 已过期，请重新复制。"); return; }
      addLog("保存","更新 "+(u.name||u.url)+" 的 auth_token");
      var r=await api("/api/upstreams/"+encodeURIComponent(u.id),{method:"PATCH",body:{token:token}}); state.config=r.config; renderAll(); await refreshCurrentUpstream();
    }
    async function refreshCurrentUpstream(){
      var u=currentUpstream(); if(!u) return; addLog("刷新","刷新当前上游："+(u.name||u.url));
      var r=await api("/api/upstreams/"+encodeURIComponent(u.id)+"/refresh",{method:"POST"}); state.config=r.config;
      if(r.result&&r.result.ok) addLog("刷新",(u.name||u.url)+" 完成，分组 "+(r.result.count||0)+" 个"); else addLogHtml("刷新",refreshFailureHtml(u,r.result));
      renderAll();
    }
    async function deleteCurrentUpstream(){
      var u=currentUpstream(); if(!u) return; var label=u.name||u.url;
      if(!confirm("确定删除当前上游「"+label+"」吗？\n只会删除监控记录，不影响上游网站。")) return;
      addLog("删除","删除当前上游："+label);
      var r=await api("/api/upstreams/"+encodeURIComponent(u.id),{method:"DELETE"}); state.config=r.config;
      state.selectedUpstreamId=(state.config.upstreams[0]&&state.config.upstreams[0].id)||""; state.selectedGroupId=""; renderAll();
    }

    /* ---------- config / defaults ---------- */
    async function saveServer(){
      addLog("保存","写入 sub2api 服务器配置");
      var r=await api("/api/config",{method:"PUT",body:{sub2api:{baseUrl:byId("sub2apiBaseUrl").value.trim(),adminApiKey:byId("sub2apiAdminKey").value.trim()}}});
      state.config=r.config; byId("sub2apiAdminKey").value=""; syncForms(); renderAll();
    }
    async function saveDefaults(){ addLog("保存","写入创建参数"); var r=await api("/api/config",{method:"PUT",body:{importDefaults:collectSettings()}}); state.config=r.config; syncForms(); renderAll(); }
    function collectSettings(){
      return { create_count:byId("setCreateCount").value, account_prefix:"hc", base_url:byId("setBaseUrl").value,
        concurrency:byId("setConcurrency").value, load_factor:byId("setLoadFactor").value, priority:byId("setPriority").value,
        platform:desiredAccountPlatform()||byId("setPlatform").value, type:byId("setType").value, rate_multiplier_mode:byId("setRateMode").value,
        rate_multiplier:byId("setRateMultiplier").value, model_mapping_text:byId("setModelMapping").value, notes:byId("setNotes").value };
    }
    function syncForms(){
      var c=state.config||{}, d=c.importDefaults||{};
      byId("sub2apiBaseUrl").value=(c.sub2api&&c.sub2api.baseUrl)||"";
      var saved=c.sub2api&&c.sub2api.adminApiKeySaved;
      byId("adminKeyState").textContent=saved?"已保存":"未保存"; byId("adminKeyState").className="badge "+(saved?"good":"");
      setValue("setCreateCount",d.create_count||1); setValue("setBaseUrl",d.base_url||"");
      setValue("setConcurrency",d.concurrency||10); setValue("setLoadFactor",d.load_factor||10);
      setValue("setPriority",d.priority||1); setValue("setPlatform",d.platform||"openai");
      setValue("setType",d.type||"apikey"); setValue("setRateMode",d.rate_multiplier_mode||"upstream");
      setValue("setRateMultiplier",d.rate_multiplier||""); setValue("setModelMapping",d.model_mapping_text||""); setValue("setNotes",d.notes||"");
      syncSelectedGroupPlatform();
    }

    /* ---------- refresh all (parallel) ---------- */
    async function refreshAll(isBoot){
      if(state.busy) return; state.busy=true; byId("refreshBtn").classList.add("pulse");
      var total=((state.config&&state.config.upstreams)||[]).length;
      setStatus("正在并行刷新所有上游...");
      setProgress({active:true,done:0,total:total,ok:0,fail:0,current:total?"并行刷新中":"没有上游",title:"刷新上游"});
      if(!isBoot) addLog("刷新","开始并行刷新所有上游");
      try{
        if(!total){ setStatus("还没有上游配置"); setProgress({active:false}); return; }
        var batch=await api("/api/refresh",{method:"POST"});
        state.config=batch.config;
        var ok=0,fail=0; var byU={}; (state.config.upstreams||[]).forEach(function(u){byU[u.id]=u;});
        (batch.results||[]).forEach(function(r){
          var u=byU[r.upstreamId]||{name:r.upstreamId};
          if(r&&r.ok){ ok++; addLog("刷新",(u.name||u.url)+" 完成，分组 "+(r.count||0)+" 个"); }
          else { fail++; addLogHtml("刷新",refreshFailureHtml(u,r)); }
        });
        addLog("刷新","完成：成功 "+ok+"，失败 "+fail);
        setProgress({active:true,done:total,total:total,ok:ok,fail:fail,current:"刷新完成",title:"刷新完成"});
        renderAll();
        setTimeout(function(){ if(!state.busy) setProgress({active:false}); },1500);
      }catch(e){ setStatus("刷新失败："+e.message); }
      finally{ state.busy=false; byId("refreshBtn").classList.remove("pulse"); }
    }

    /* ---------- keys / import ---------- */
    async function loadLocalGroups(){ addLog("本地","读取 sub2api 本地分组"); var r=await api("/api/sub2api/groups"); state.localGroups=r.groups||[]; addLog("本地","读取到 "+state.localGroups.length+" 个分组"); renderLocalGroups(); }
    async function createImport(){
      if(!state.selectedUpstreamId||!state.selectedGroupId){ addLog("校验","请选择一个上游分组"); return; }
      if(!state.localGroupIds.length){ addLog("校验","请选择至少一个本地分组"); return; }
      var platforms=selectedLocalGroupPlatforms();
      if(platforms.length>1){ addLog("校验","所选本地分组平台不一致："+platforms.join("、")+"，请只选择同平台分组"); return; }
      var wanted=desiredAccountPlatform(), localPlatform=selectedLocalGroupPlatform();
      if(wanted&&localPlatform&&wanted!==localPlatform){ addLog("校验","账号平台 "+wanted+" 与本地分组平台 "+localPlatform+" 不一致，请换成同平台分组"); return; }
      addLog("执行","开始创建并导入");
      var r=await api("/api/create-import",{method:"POST",body:{upstream_id:state.selectedUpstreamId,upstream_group_id:Number(state.selectedGroupId),local_group_ids:state.localGroupIds,settings:collectSettings()}});
      (r.logs||[]).forEach(function(it){ addLog(it.stage||"执行",it.message||""); });
      addLog("结果","创建 key "+((r.created||[]).length)+" 个");
    }
    async function fixLocalPlatform(){
      if(!state.localGroupIds.length){ addLog("校验","请选择至少一个本地分组"); return; }
      var platforms=selectedLocalGroupPlatforms();
      if(!platforms.length){ addLog("校验","所选本地分组没有平台信息，请先刷新本地分组"); return; }
      if(platforms.length>1){ addLog("校验","所选本地分组平台不一致："+platforms.join("、")+"，请只选择同平台分组"); return; }
      var platform=platforms[0];
      if(!confirm("将已选本地分组内的账号平台修正为 "+platform+" 吗？\n这会影响 sub2api 测试连接和模型路由。")) return;
      addLog("修正","开始修正本地分组账号平台："+platform);
      var r=await api("/api/sub2api/fix-platform",{method:"POST",body:{local_group_ids:state.localGroupIds,platform:platform}});
      (r.logs||[]).forEach(function(it){ addLog(it.stage||"修正",it.message||""); });
      addLog("修正","完成：影响账号 "+(r.affected||0)+" 个");
    }

    /* ---------- auto refresh ---------- */
    function onAutoRefreshChange(){
      var on=byId("autoRefreshToggle").checked; byId("autoRefreshBox").classList.toggle("on",on);
      try{ localStorage.setItem("auto_refresh_on",on?"1":"0"); localStorage.setItem("auto_refresh_interval",byId("autoRefreshInterval").value); }catch(e){}
      stopAuto(); if(on) startAuto(); else byId("autoRefreshCountdown").textContent="";
    }
    function startAuto(){
      var secs=parseInt(byId("autoRefreshInterval").value,10)||60; state.autoRemaining=secs;
      byId("autoRefreshCountdown").textContent=state.autoRemaining+"s";
      state.autoTimer=setInterval(function(){
        state.autoRemaining-=1;
        if(state.autoRemaining<=0){ state.autoRemaining=secs; if(!state.busy&&state.config) refreshAll(true); }
        var el=byId("autoRefreshCountdown"); if(el) el.textContent=state.autoRemaining+"s";
      },1000);
    }
    function stopAuto(){ if(state.autoTimer){ clearInterval(state.autoTimer); state.autoTimer=null; } var el=byId("autoRefreshCountdown"); if(el) el.textContent=""; }
    function restoreAutoRefresh(){
      try{ var iv=localStorage.getItem("auto_refresh_interval"); if(iv) byId("autoRefreshInterval").value=iv;
        if(localStorage.getItem("auto_refresh_on")==="1"){ byId("autoRefreshToggle").checked=true; onAutoRefreshChange(); } }catch(e){}
    }

    /* ---------- history ---------- */
    function openHistory(open){
      state.historyOpen=open;
      byId("historyDock").classList.toggle("hidden",!open);
      byId("historyScrim").classList.toggle("hidden",!open);
    }
    async function toggleHistory(){ openHistory(!state.historyOpen); if(state.historyOpen) await loadHistory(); }
    async function loadHistory(){ try{ var r=await api("/api/history"); renderHistory(r.events||[]); }catch(e){ renderHistory([]); } }
    function renderHistory(events){
      var host=byId("historyList"); if(!host) return;
      if(!events.length){ host.innerHTML='<div class="history-empty">暂无倍率变化记录<br>刷新后若有上游倍率变动，会自动记录到此</div>'; return; }
      host.innerHTML=events.map(function(ev){
        var from=ev.from==null||ev.from===""?"?":ev.from, to=ev.to==null||ev.to===""?"?":ev.to;
        return '<div class="history-row"><span class="h-time">'+esc(formatTime(ev.ts))+'</span><span class="h-up">'+esc(ev.upstreamName||"")+'</span><span class="h-group">'+esc(ev.groupName||ev.groupId)+'</span><span class="h-change"><span class="h-old">×'+esc(from)+'</span><span class="h-arrow">→</span><span class="h-new">×'+esc(to)+'</span></span></div>';
      }).join("");
    }
    async function clearHistory(){ if(!confirm("确认清空倍率变化历史？")) return; try{ await api("/api/history",{method:"DELETE"}); }catch(e){} renderHistory([]); }

    /* ---------- theme ---------- */
    function applyTheme(t){ document.documentElement.setAttribute("data-theme",t); try{ localStorage.setItem("monitor_theme",t); }catch(e){} }
    function toggleTheme(){ applyTheme(document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark"); }

    /* ---------- auth / boot ---------- */
    function showLogin(){ byId("loginScreen").classList.remove("hidden"); byId("appScreen").classList.add("hidden"); stopAuto(); }
    function showApp(){ byId("loginScreen").classList.add("hidden"); byId("appScreen").classList.remove("hidden"); restoreAutoRefresh(); }
    async function login(){
      byId("loginError").textContent="";
      try{
        await api("/api/login",{method:"POST",body:{username:byId("loginUser").value.trim(),password:byId("loginPass").value},allow401:true});
        showApp(); await loadConfig(); if((state.config.upstreams||[]).length) await refreshAll(true);
      }catch(e){ byId("loginError").textContent=e.message; }
    }
    async function logout(){ try{ await api("/api/logout",{method:"POST",silent:true}); }finally{ showLogin(); } }
    async function loadConfig(){
      var r=await api("/api/config"); state.config=r.config;
      if(!state.selectedUpstreamId&&state.config.upstreams.length) state.selectedUpstreamId=state.config.upstreams[0].id;
      syncForms(); renderAll();
    }
    async function bootstrap(){
      try{ var iv=localStorage.getItem("monitor_theme"); if(iv) document.documentElement.setAttribute("data-theme",iv); }catch(e){}
      var s=await api("/api/session",{silent:true,allow401:true});
      if(!s.authenticated){ showLogin(); return; }
      showApp(); await loadConfig(); if((state.config.upstreams||[]).length) await refreshAll(true);
    }

    function bindEvents(){
      byId("loginBtn").addEventListener("click",login);
      byId("loginPass").addEventListener("keydown",function(e){ if(e.key==="Enter") login(); });
      byId("logoutBtn").addEventListener("click",logout);
      byId("refreshBtn").addEventListener("click",function(){ refreshAll(false); });
      byId("refreshBalancesBtn").addEventListener("click",function(){ refreshAll(false); });
      byId("addUpstreamBtn").addEventListener("click",addUpstream);
      byId("markUpstreamBtn").addEventListener("click",markCurrentUpstream);
      byId("clearMarkBtn").addEventListener("click",clearCurrentMark);
      byId("renameUpstreamBtn").addEventListener("click",renameCurrentUpstream);
      byId("updateTokenBtn").addEventListener("click",updateCurrentToken);
      byId("deleteUpstreamBtn").addEventListener("click",deleteCurrentUpstream);
      byId("saveServerBtn").addEventListener("click",saveServer);
      byId("saveDefaultsBtn").addEventListener("click",saveDefaults);
      byId("setPlatform").addEventListener("input",syncModelMappingHint);
      byId("loadLocalGroupsBtn").addEventListener("click",loadLocalGroups);
      byId("createImportBtn").addEventListener("click",createImport);
      byId("fixLocalPlatformBtn").addEventListener("click",fixLocalPlatform);
      byId("clearSelectionBtn").addEventListener("click",function(){ state.selectedGroupId=""; renderAll(); });
      byId("clearLogsBtn").addEventListener("click",function(){ byId("logs").innerHTML=""; });
      byId("showHidden").addEventListener("change",renderAll);
      byId("autoRefreshToggle").addEventListener("change",onAutoRefreshChange);
      byId("autoRefreshInterval").addEventListener("change",onAutoRefreshChange);
      byId("historyBtn").addEventListener("click",toggleHistory);
      byId("refreshHistoryBtn").addEventListener("click",loadHistory);
      byId("clearHistoryBtn").addEventListener("click",clearHistory);
      byId("closeHistoryBtn").addEventListener("click",function(){ openHistory(false); });
      byId("historyScrim").addEventListener("click",function(){ openHistory(false); });
      byId("themeBtn").addEventListener("click",toggleTheme);
    }

    bindEvents();
    bootstrap();
  })();
  </script>
</body>
</html>
`;

const CONFIG_KEY = "config:v1";
const SESSION_COOKIE = "upstream_monitor_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const DEFAULT_SUB2API_BASE_URL = "";
const DEFAULT_MODEL_MAPPING = {
  "gpt-5.2": "gpt-5.2",
  "gpt-5.4": "gpt-5.4",
  "gpt-5.5": "gpt-5.5",
  "gpt-5.2-pro": "gpt-5.2-pro",
  "gpt-image-1": "gpt-image-1",
  "gpt-image-2": "gpt-image-2",
  "gpt-5.4-mini": "gpt-5.4-mini",
  "gpt-5.3-codex": "gpt-5.3-codex",
  "gpt-image-1.5": "gpt-image-1.5",
  "codex-auto-review": "codex-auto-review",
  "gpt-5.2-2025-12-11": "gpt-5.2-2025-12-11",
  "gpt-5.4-2026-03-05": "gpt-5.4-2026-03-05",
  "gpt-5.2-chat-latest": "gpt-5.2-chat-latest",
  "gpt-5.3-codex-spark": "gpt-5.3-codex-spark",
  "gpt-4o-audio-preview": "gpt-4o-audio-preview",
  "gpt-5.2-pro-2025-12-11": "gpt-5.2-pro-2025-12-11",
  "gpt-4o-realtime-preview": "gpt-4o-realtime-preview",
};
const DEFAULT_SETTINGS = {
  upstreams: [],
  sub2api: {
    baseUrl: DEFAULT_SUB2API_BASE_URL,
    adminApiKey: "",
  },
  importDefaults: {
    create_count: 1,
    account_prefix: "hc",
    base_url: "",
    concurrency: 10,
    load_factor: 10,
    priority: 1,
    group_priority: 1,
    rate_multiplier_mode: "upstream",
    rate_multiplier: "",
    platform: "openai",
    type: "apikey",
    model_mapping_text: JSON.stringify(DEFAULT_MODEL_MAPPING, null, 2),
    notes: "",
  },
};

export default {
  async fetch(request, env) {
  try {
    return await route(request, env);
  } catch (error) {
      return json({ error: error?.message || String(error) }, error?.status || 500);
  }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(refreshAllUpstreams(env).catch(() => {}));
  },
};

async function route(request, env) {
  const url = new URL(request.url);
  if (url.pathname === "/api/login" && request.method === "POST") return handleLogin(request, env);
  if (url.pathname === "/api/logout" && request.method === "POST") return handleLogout();
  if (url.pathname === "/api/session" && request.method === "GET") return json({ authenticated: await isAuthenticated(request, env) });

  if (url.pathname.startsWith("/api/")) {
    await requireAuth(request, env);
    if (url.pathname === "/api/config" && request.method === "GET") return handleGetConfig(env);
    if (url.pathname === "/api/config" && request.method === "PUT") return handlePutConfig(request, env);
    if (url.pathname === "/api/refresh" && request.method === "POST") return handleRefreshAll(env);
    if (url.pathname === "/api/upstreams" && request.method === "POST") return handleAddUpstream(request, env);
    if (url.pathname.match(/^\/api\/upstreams\/[^/]+\/refresh$/) && request.method === "POST") {
      const [, , , upstreamId] = url.pathname.split("/");
      return handleRefreshUpstream(env, decodeURIComponent(upstreamId));
    }
    if (url.pathname.match(/^\/api\/upstreams\/[^/]+$/) && request.method === "PATCH") return handlePatchUpstream(request, env, url.pathname.split("/").pop());
    if (url.pathname.match(/^\/api\/upstreams\/[^/]+$/) && request.method === "DELETE") return handleDeleteUpstream(env, url.pathname.split("/").pop());
    if (url.pathname.match(/^\/api\/upstreams\/[^/]+\/groups\/[^/]+\/hide$/) && request.method === "POST") {
      const [, , , upstreamId, , groupId] = url.pathname.split("/");
      return handleHideGroup(env, upstreamId, decodeURIComponent(groupId));
    }
    if (url.pathname.match(/^\/api\/upstreams\/[^/]+\/groups\/[^/]+\/restore$/) && request.method === "POST") {
      const [, , , upstreamId, , groupId] = url.pathname.split("/");
      return handleRestoreGroup(env, upstreamId, decodeURIComponent(groupId));
    }
    if (url.pathname.match(/^\/api\/upstreams\/[^/]+\/groups\/[^/]+\/used$/) && (request.method === "POST" || request.method === "DELETE")) {
      const [, , , upstreamId, , groupId] = url.pathname.split("/");
      return handleSetGroupUsed(env, upstreamId, decodeURIComponent(groupId), request.method === "POST");
    }
    if (url.pathname === "/api/sub2api/groups" && request.method === "GET") return handleSub2apiGroups(env);
    if (url.pathname === "/api/sub2api/fix-platform" && request.method === "POST") return handleFixSub2apiGroupPlatform(request, env);
    if (url.pathname === "/api/create-import" && request.method === "POST") return handleCreateAndImport(request, env);
    if (url.pathname === "/api/history" && request.method === "GET") return json({ events: await loadHistory(env) });
    if (url.pathname === "/api/history" && request.method === "DELETE") {
      await env.MONITOR_DATA.put(HISTORY_KEY, JSON.stringify([]));
      return json({ ok: true });
    }
    return json({ error: "接口不存在" }, 404);
  }

  if (request.method === "GET" || request.method === "HEAD") {
    return new Response(request.method === "HEAD" ? null : APP_HTML, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
  return json({ error: "Method not allowed" }, 405);
}

async function handleLogin(request, env) {
  const body = await readJson(request);
  const configuredUser = env.ADMIN_USER || "admin";
  const configuredPassword = env.ADMIN_PASSWORD || "";
  if (!configuredPassword) throw new Error("Worker secret ADMIN_PASSWORD is not configured.");
  if (String(body.username || "") !== configuredUser || String(body.password || "") !== configuredPassword) {
    return json({ error: "账号或密码不正确" }, 401);
  }
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = await signSession(`${configuredUser}:${expiresAt}`, env);
  return json(
    { ok: true, user: configuredUser },
    200,
    {
      "set-cookie": `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`,
    },
  );
}

async function handleLogout() {
  return json(
    { ok: true },
    200,
    {
      "set-cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    },
  );
}

async function isAuthenticated(request, env) {
  const cookie = parseCookies(request.headers.get("cookie") || "")[SESSION_COOKIE];
  if (!cookie) return false;
  const value = await verifySession(cookie, env);
  if (!value) return false;
  const parts = value.split(":");
  const expiresAt = Number(parts.pop());
  return Number.isFinite(expiresAt) && expiresAt > Math.floor(Date.now() / 1000);
}

async function requireAuth(request, env) {
  if (!(await isAuthenticated(request, env))) throw new HttpError(401, "请先登录。");
}

async function signSession(value, env) {
  const secret = await hmacKey(env);
  const data = enc(value);
  const sig = await crypto.subtle.sign("HMAC", secret, data);
  return `${base64url(data)}.${base64url(new Uint8Array(sig))}`;
}

async function verifySession(token, env) {
  const [payloadPart, sigPart] = String(token || "").split(".");
  if (!payloadPart || !sigPart) return null;
  const payload = base64urlDecode(payloadPart);
  const sig = base64urlDecode(sigPart);
  const secret = await hmacKey(env);
  const ok = await crypto.subtle.verify("HMAC", secret, sig, payload);
  return ok ? dec(payload) : null;
}

async function hmacKey(env) {
  return crypto.subtle.importKey("raw", enc(env.ENCRYPTION_SECRET || env.ADMIN_PASSWORD || "fallback-secret"), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function handleGetConfig(env) {
  const config = await loadConfig(env);
  return json({ config: redactConfig(config) });
}

async function handlePutConfig(request, env) {
  const body = await readJson(request);
  const config = await loadConfig(env);
  if (body.sub2api && typeof body.sub2api === "object") {
    config.sub2api.baseUrl = normalizeSiteUrl(body.sub2api.baseUrl || config.sub2api.baseUrl || DEFAULT_SUB2API_BASE_URL);
    if (typeof body.sub2api.adminApiKey === "string" && body.sub2api.adminApiKey.trim()) {
      config.sub2api.adminApiKey = await encryptSecret(body.sub2api.adminApiKey.trim(), env);
    }
  }
  if (body.importDefaults && typeof body.importDefaults === "object") {
    config.importDefaults = {
      ...config.importDefaults,
      ...sanitizeImportDefaults(body.importDefaults),
    };
  }
  await saveConfig(env, config);
  return json({ config: redactConfig(config) });
}

async function handleAddUpstream(request, env) {
  const body = await readJson(request);
  const config = await loadConfig(env);
  const url = normalizeSiteUrl(body.url);
  const token = String(body.token || "").trim();
  if (!url) throw new HttpError(400, "请填写上游 URL。");
  if (!token) throw new HttpError(400, "请填写上游 auth_token。");
  const id = stableId(`${url}:${Date.now()}:${crypto.randomUUID()}`);
  const now = new Date().toISOString();
  const name = String(body.name || domainLabel(url)).trim() || domainLabel(url);
  const tokenMeta = jwtMeta(token);
  config.upstreams.push({
    id,
    name,
    url,
    token: await encryptSecret(token, env),
    tokenExpiresAt: tokenMeta.expiresAt,
    hiddenGroupIds: [],
    usedGroupIds: [],
    snapshot: null,
    createdAt: now,
    updatedAt: now,
  });
  await saveConfig(env, config);
  return json({ config: redactConfig(config) });
}

async function handlePatchUpstream(request, env, upstreamId) {
  const body = await readJson(request);
  const config = await loadConfig(env);
  const upstream = findUpstream(config, upstreamId);
  if (body.name !== undefined) upstream.name = String(body.name || "").trim() || upstream.name;
  if (body.mark !== undefined) upstream.mark = String(body.mark || "").trim().slice(0, 24);
  if (body.url !== undefined) upstream.url = normalizeSiteUrl(body.url);
  if (typeof body.token === "string" && body.token.trim()) {
    const token = body.token.trim();
    const tokenMeta = jwtMeta(token);
    upstream.token = await encryptSecret(token, env);
    upstream.tokenExpiresAt = tokenMeta.expiresAt;
  }
  upstream.updatedAt = new Date().toISOString();
  await saveConfig(env, config);
  return json({ config: redactConfig(config) });
}

async function handleDeleteUpstream(env, upstreamId) {
  const config = await loadConfig(env);
  config.upstreams = config.upstreams.filter((item) => item.id !== upstreamId);
  await saveConfig(env, config);
  return json({ config: redactConfig(config) });
}

async function handleHideGroup(env, upstreamId, groupId) {
  const config = await loadConfig(env);
  const upstream = findUpstream(config, upstreamId);
  upstream.hiddenGroupIds = Array.from(new Set([...(upstream.hiddenGroupIds || []), String(groupId)]));
  upstream.updatedAt = new Date().toISOString();
  await saveConfig(env, config);
  return json({ config: redactConfig(config) });
}

async function handleRestoreGroup(env, upstreamId, groupId) {
  const config = await loadConfig(env);
  const upstream = findUpstream(config, upstreamId);
  upstream.hiddenGroupIds = (upstream.hiddenGroupIds || []).filter((id) => id !== String(groupId));
  upstream.updatedAt = new Date().toISOString();
  await saveConfig(env, config);
  return json({ config: redactConfig(config) });
}

async function handleSetGroupUsed(env, upstreamId, groupId, used) {
  const config = await loadConfig(env);
  const upstream = findUpstream(config, upstreamId);
  const id = String(groupId);
  upstream.usedGroupIds = used
    ? Array.from(new Set([...(upstream.usedGroupIds || []), id]))
    : (upstream.usedGroupIds || []).filter((item) => item !== id);
  upstream.updatedAt = new Date().toISOString();
  await saveConfig(env, config);
  return json({ config: redactConfig(config) });
}

const REFRESH_CONCURRENCY = 6;
const HISTORY_KEY = "history:v1";
const HISTORY_LIMIT = 500;

async function mapWithConcurrency(items, limit, worker) {
  const list = Array.isArray(items) ? items : [];
  const results = new Array(list.length);
  let next = 0;
  async function run() {
    while (next < list.length) {
      const index = next;
      next += 1;
      results[index] = await worker(list[index], index);
    }
  }
  const size = Math.max(1, Math.min(limit, list.length || 1));
  const runners = [];
  for (let i = 0; i < size; i += 1) runners.push(run());
  await Promise.all(runners);
  return results;
}

async function refreshAllUpstreams(env) {
  const config = await loadConfig(env);
  const refreshedAt = new Date().toISOString();
  const results = await mapWithConcurrency(
    config.upstreams,
    REFRESH_CONCURRENCY,
    (upstream) => refreshUpstreamSnapshot(upstream, env, refreshedAt),
  );
  await saveConfig(env, config);
  await appendHistory(env, collectRateEvents(results, config.upstreams, refreshedAt));
  return { config, results };
}

async function handleRefreshAll(env) {
  const { config, results } = await refreshAllUpstreams(env);
  return json({ config: redactConfig(config), results });
}

async function handleRefreshUpstream(env, upstreamId) {
  const config = await loadConfig(env);
  const upstream = findUpstream(config, upstreamId);
  const refreshedAt = new Date().toISOString();
  const result = await refreshUpstreamSnapshot(upstream, env, refreshedAt);
  await saveConfig(env, config);
  if (result && result.ok && result.changes) {
    await appendHistory(env, buildRateEvents(upstream, result.changes, refreshedAt));
  }
  return json({ config: redactConfig(config), result });
}

function collectRateEvents(results, upstreams, refreshedAt) {
  const byId = new Map((upstreams || []).map((u) => [u.id, u]));
  const events = [];
  for (const r of results || []) {
    if (!r || !r.ok || !r.changes) continue;
    const upstream = byId.get(r.upstreamId);
    if (upstream) events.push(...buildRateEvents(upstream, r.changes, refreshedAt));
  }
  return events;
}

function buildRateEvents(upstream, changes, ts) {
  const events = [];
  const changed = changes && Array.isArray(changes.changed) ? changes.changed : [];
  for (const item of changed) {
    if (!item || !item.fields || !item.fields.rate_multiplier) continue;
    const before = item.before || {};
    const after = item.after || {};
    events.push({
      ts,
      upstreamId: upstream.id,
      upstreamName: upstream.name || upstream.url || "",
      groupId: item.id,
      groupName: after.name || before.name || String(item.id),
      from: before.effective_rate_multiplier || before.rate_multiplier || "",
      to: after.effective_rate_multiplier || after.rate_multiplier || "",
      base: after.base_rate_multiplier || "",
    });
  }
  return events;
}

async function loadHistory(env) {
  try {
    const raw = await env.MONITOR_DATA.get(HISTORY_KEY, "json");
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    return [];
  }
}

async function appendHistory(env, events) {
  if (!events || !events.length) return;
  const existing = await loadHistory(env);
  const merged = events.concat(existing).slice(0, HISTORY_LIMIT);
  await env.MONITOR_DATA.put(HISTORY_KEY, JSON.stringify(merged));
}

async function refreshUpstreamSnapshot(upstream, env, refreshedAt) {
  try {
    const token = await decryptSecret(upstream.token, env);
    const tokenMeta = jwtMeta(token);
    upstream.tokenExpiresAt = tokenMeta.expiresAt || upstream.tokenExpiresAt || "";
    if (tokenMeta.expired) {
      const detail = upstreamFailure(upstream, "auth_token 已过期，请打开中转站重新获取。", { tokenExpired: true, tokenExpiresAt: tokenMeta.expiresAt });
      upstream.snapshot = {
        ...(upstream.snapshot || { groups: [] }),
        refreshedAt,
        ...detail,
      };
      upstream.updatedAt = refreshedAt;
      return { upstreamId: upstream.id, ok: false, ...detail };
    }
    const [groups, balance] = await Promise.all([
      fetchEffectiveUpstreamGroups(upstream.url, token),
      safeFetchUpstreamBalance(upstream.url, token, refreshedAt),
    ]);
    const previous = upstream.snapshot?.groups || [];
    const changes = compareGroups(previous, groups);
    upstream.snapshot = { groups, refreshedAt, changes };
    upstream.balance = balance;
    upstream.updatedAt = refreshedAt;
    return { upstreamId: upstream.id, ok: true, count: groups.length, changes, balance };
  } catch (error) {
    const detail = upstreamFailure(upstream, error?.message || String(error));
    upstream.snapshot = {
      ...(upstream.snapshot || { groups: [] }),
      refreshedAt,
      ...detail,
    };
    upstream.updatedAt = refreshedAt;
    return { upstreamId: upstream.id, ok: false, ...detail };
  }
}

async function handleSub2apiGroups(env) {
  const config = await loadConfig(env);
  const groups = await fetchSub2apiGroups(config, env);
  return json({ groups });
}

async function handleFixSub2apiGroupPlatform(request, env) {
  const body = await readJson(request);
  const config = await loadConfig(env);
  const localGroupIds = arrayOfPositiveInts(body.local_group_ids);
  if (!localGroupIds.length) throw new HttpError(400, "请选择要修正的本地分组。");

  const localGroups = await fetchSub2apiGroups(config, env);
  const groupPlatform = resolveSingleLocalGroupPlatform(localGroups, localGroupIds);
  const requestedPlatform = normalizeAccountPlatform(body.platform);
  const platform = requestedPlatform || groupPlatform;
  validateAccountPlatform(platform);
  if (requestedPlatform && groupPlatform && requestedPlatform !== groupPlatform) {
    throw new HttpError(400, `所选本地分组平台是 ${groupPlatform}，不能修正为 ${requestedPlatform}。`);
  }

  const logs = [logLine("修正", `准备把本地分组 ${localGroupIds.join(", ")} 内账号平台修正为 ${platform}`)];
  const results = [];
  let affected = 0;
  let failed = 0;
  for (const groupId of localGroupIds) {
    const group = localGroups.find((item) => Number(item.id) === Number(groupId));
    try {
      const result = await sub2apiRequest(config, env, "POST", "/api/v1/admin/accounts/bulk-update", {
        filters: { group: String(groupId) },
        platform,
        confirm_mixed_channel_risk: true,
      });
      const count = Number(result?.success ?? result?.affected ?? result?.success_ids?.length ?? 0);
      affected += Number.isFinite(count) ? count : 0;
      results.push({ group_id: groupId, ok: true, result });
      logs.push(logLine("修正", `${group?.name || groupId} 已修正，影响账号 ${Number.isFinite(count) ? count : "?"} 个`));
    } catch (error) {
      failed += 1;
      const message = error?.message || String(error);
      results.push({ group_id: groupId, ok: false, error: message });
      logs.push(logLine("修正", `${group?.name || groupId} 修正失败：${message}`));
    }
  }
  return json({ ok: failed === 0, affected, failed, platform, results, logs });
}

async function handleCreateAndImport(request, env) {
  const body = await readJson(request);
  const config = await loadConfig(env);
  const upstream = findUpstream(config, body.upstream_id);
  const groupId = Number(body.upstream_group_id);
  if (!Number.isFinite(groupId) || groupId <= 0) throw new HttpError(400, "请选择上游分组。");

  const groups = upstream.snapshot?.groups?.length
    ? upstream.snapshot.groups
    : await fetchEffectiveUpstreamGroups(upstream.url, await decryptSecret(upstream.token, env));
  const upstreamGroup = groups.find((g) => Number(g.id) === groupId);
  if (!upstreamGroup) throw new HttpError(400, "上游分组不存在或已不可用。");

  const settings = {
    ...config.importDefaults,
    ...sanitizeImportDefaults(body.settings || {}),
  };
  const createCount = clampInt(settings.create_count, 1, 100);
  const localGroupIds = arrayOfPositiveInts(body.local_group_ids);
  if (!localGroupIds.length) throw new HttpError(400, "请选择要导入的本地分组。");
  const localGroups = await fetchSub2apiGroups(config, env);
  const localGroupPlatform = resolveSingleLocalGroupPlatform(localGroups, localGroupIds);

  const token = await decryptSecret(upstream.token, env);
  const logs = [];
  logs.push(logLine("开始", `准备在 ${upstream.name} 创建 ${createCount} 个 key`));

  const existingKeys = await fetchUpstreamKeys(upstream.url, token);
  const baseName = autoKeyNameBase(upstream.url, upstreamGroup.rate_multiplier);
  const maxIndex = findExistingAutoKeyMax(existingKeys, baseName);
  logs.push(logLine("命名", `自动前缀 ${baseName}，已有最大序号 ${maxIndex}`));

  const created = [];
  for (let index = 1; index <= createCount; index += 1) {
    const name = `${baseName}-${maxIndex + index}`;
    logs.push(logLine("上游", `创建 key：${name}`));
    const item = await createUpstreamKey(upstream.url, token, name, groupId);
    created.push({ name, key: extractCreatedKey(item), raw: item });
  }

  const rateMultiplier = settings.rate_multiplier_mode === "manual"
    ? numberOrDefault(settings.rate_multiplier, upstreamGroup.rate_multiplier || 1)
    : numberOrDefault(upstreamGroup.rate_multiplier, 1);
  const importBaseUrl = normalizeSiteUrl(settings.base_url || upstream.url);
  const notes = settings.notes || upstream.url;
  const configuredModelMapping = parseJsonObject(settings.model_mapping_text, "model_mapping");
  const settingsPlatform = normalizeAccountPlatform(settings.platform);
  const upstreamPlatform = normalizeAccountPlatform(upstreamGroup.platform);
  const accountPlatform = settingsPlatform || upstreamPlatform || localGroupPlatform || "openai";
  validateAccountPlatform(accountPlatform);
  if (localGroupPlatform && accountPlatform !== localGroupPlatform) {
    throw new HttpError(400, `账号平台 ${accountPlatform} 与本地分组平台 ${localGroupPlatform} 不一致，请选择同平台本地分组。`);
  }
  if (upstreamPlatform && upstreamPlatform !== accountPlatform) {
    throw new HttpError(400, `上游分组平台 ${upstreamPlatform} 与账号平台 ${accountPlatform} 不一致，请检查创建参数。`);
  }
  const modelMapping = shouldAttachModelMapping(accountPlatform, configuredModelMapping) ? configuredModelMapping : null;
  logs.push(logLine("参数", `导入平台 ${accountPlatform}，本地分组 ${localGroupIds.join(", ")}`));
  if (configuredModelMapping && !modelMapping) logs.push(logLine("参数", `model_mapping 与 ${accountPlatform} 平台不匹配，已跳过`));

  const accounts = created.map((item) => ({
    name: item.name,
    notes,
    platform: accountPlatform,
    type: settings.type || "upstream",
    credentials: {
      base_url: importBaseUrl,
      api_key: item.key,
      ...(modelMapping ? { model_mapping: modelMapping } : {}),
    },
    extra: {},
    concurrency: clampInt(settings.concurrency, 0, 100000),
    priority: clampInt(settings.priority, 0, 100000),
    load_factor: clampInt(settings.load_factor, 1, 10000),
    rate_multiplier: rateMultiplier,
    group_ids: localGroupIds,
    confirm_mixed_channel_risk: true,
  }));

  logs.push(logLine("导入", `向 sub2api 批量导入 ${accounts.length} 个账号`));
  const imported = await sub2apiRequest(config, env, "POST", "/api/v1/admin/accounts/batch", { accounts });
  logs.push(logLine("完成", `成功 ${imported.success ?? "?"}，失败 ${imported.failed ?? "?"}`));
  return json({
    ok: true,
    created: created.map((item) => ({ name: item.name, key_masked: maskKey(item.key) })),
    imported,
    logs,
  });
}

async function fetchUpstreamGroups(siteUrl, token) {
  const data = await upstreamRequest(siteUrl, token, "GET", "/api/v1/groups/available");
  if (!Array.isArray(data)) throw new Error("上游 /groups/available 返回格式不是数组。");
  return data
    .filter((item) => item && typeof item === "object" && item.id !== undefined)
    .map((item) => {
      const rate = normalizeRateValue(item.rate_multiplier);
      return {
        id: Number(item.id),
        name: String(item.name || item.id),
        platform: String(item.platform || ""),
        base_rate_multiplier: rate,
        effective_rate_multiplier: rate,
        rate_multiplier: rate,
        rate_source: "group",
        status: String(item.status || ""),
        subscription_type: String(item.subscription_type || ""),
        description: firstText(item.description, item.remark, item.remarks, item.notes, item.note, item.memo),
      };
    })
    .sort((a, b) => numberOrDefault(a.rate_multiplier, 9999) - numberOrDefault(b.rate_multiplier, 9999) || a.name.localeCompare(b.name));
}

async function fetchEffectiveUpstreamGroups(siteUrl, token) {
  const [groups, userRates] = await Promise.all([
    fetchUpstreamGroups(siteUrl, token),
    safeFetchUpstreamGroupRates(siteUrl, token),
  ]);
  return applyUserGroupRates(groups, userRates);
}

async function safeFetchUpstreamGroupRates(siteUrl, token) {
  try {
    const data = await upstreamRequest(siteUrl, token, "GET", "/api/v1/groups/rates");
    return normalizeGroupRateMap(data);
  } catch {
    return {};
  }
}

function applyUserGroupRates(groups, userRates) {
  const rates = userRates && typeof userRates === "object" ? userRates : {};
  return groups.map((group) => {
    const userRate = firstDefined(rates[String(group.id)], rates[group.id]);
    if (userRate === undefined || userRate === null || String(userRate).trim() === "") return group;
    const effectiveRate = normalizeRateValue(userRate);
    const baseRate = normalizeRateValue(group.base_rate_multiplier ?? group.rate_multiplier);
    return {
      ...group,
      base_rate_multiplier: baseRate,
      user_rate_multiplier: effectiveRate,
      effective_rate_multiplier: effectiveRate,
      rate_multiplier: effectiveRate,
      rate_source: rateComparable(baseRate) === rateComparable(effectiveRate) ? "group" : "user",
    };
  }).sort((a, b) => numberOrDefault(a.rate_multiplier, 9999) - numberOrDefault(b.rate_multiplier, 9999) || a.name.localeCompare(b.name));
}

function normalizeGroupRateMap(data) {
  const source = data && typeof data === "object" && !Array.isArray(data)
    ? (data.rates || data.items || data.list || data.records || data)
    : data;
  const rates = {};
  if (Array.isArray(source)) {
    for (const item of source) {
      if (!item || typeof item !== "object") continue;
      const id = firstDefined(item.group_id, item.groupId, item.id, item.group?.id);
      const rate = firstDefined(item.user_rate_multiplier, item.userRateMultiplier, item.rate_multiplier, item.rateMultiplier, item.rate, item.multiplier);
      if (id !== undefined && id !== null && rate !== undefined && rate !== null) rates[String(id)] = rate;
    }
    return rates;
  }
  if (source && typeof source === "object") {
    for (const [id, value] of Object.entries(source)) {
      if (value && typeof value === "object") {
        const rate = firstDefined(value.user_rate_multiplier, value.userRateMultiplier, value.rate_multiplier, value.rateMultiplier, value.rate, value.multiplier);
        if (rate !== undefined && rate !== null) rates[String(id)] = rate;
      } else if (value !== undefined && value !== null) {
        rates[String(id)] = value;
      }
    }
  }
  return rates;
}

async function safeFetchUpstreamBalance(siteUrl, token, refreshedAt) {
  try {
    const data = await upstreamRequest(siteUrl, token, "GET", "/api/v1/user/profile");
    const balance = extractBalance(data);
    if (!Number.isFinite(balance)) throw new Error("余额字段不存在");
    return { balance, refreshedAt };
  } catch (error) {
    return { error: error?.message || String(error), refreshedAt };
  }
}

function extractBalance(data) {
  const source = data && typeof data === "object" && data.user && typeof data.user === "object" ? data.user : data;
  for (const key of ["balance", "quota", "credit", "credits", "amount", "available_balance"]) {
    const value = source?.[key];
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return Number.NaN;
}

async function fetchUpstreamKeys(siteUrl, token) {
  const items = [];
  for (let page = 1; page <= 100; page += 1) {
    const data = await upstreamRequest(siteUrl, token, "GET", `/api/v1/keys?page=${page}&page_size=100`);
    const pageItems = Array.isArray(data) ? data : (data?.items || data?.data || data?.list || data?.records || []);
    if (!Array.isArray(pageItems)) return items;
    items.push(...pageItems.filter(Boolean));
    const total = Number(data?.total ?? data?.total_count ?? data?.count);
    if (Number.isFinite(total) && items.length >= total) break;
    if (pageItems.length < 100) break;
  }
  return items;
}

async function createUpstreamKey(siteUrl, token, name, groupId) {
  const data = await upstreamRequest(siteUrl, token, "POST", "/api/v1/keys", { name, group_id: groupId });
  if (!data || typeof data !== "object") throw new Error(`上游创建 key 返回格式异常：${name}`);
  return data;
}

async function upstreamRequest(siteUrl, token, method, path, payload) {
  const url = new URL(path, normalizeApiBase(siteUrl) + "/").toString();
  const res = await fetch(url, {
    method,
    headers: {
      accept: "application/json",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "user-agent": "upstream-monitor/1.0",
      ...(payload ? { "content-type": "application/json" } : {}),
      authorization: `Bearer ${token}`,
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const text = await res.text();
  const parsed = text ? safeJsonParse(text) : null;
  if (!res.ok) throw new Error(`上游请求失败 HTTP ${res.status}: ${formatApiError(parsed || text)}`);
  if (parsed && typeof parsed === "object" && "code" in parsed) {
    if (parsed.code === 0) return parsed.data;
    throw new Error(`上游请求失败：${formatApiError(parsed)}`);
  }
  return parsed;
}

async function fetchSub2apiGroups(config, env) {
  const data = await sub2apiRequest(config, env, "GET", "/api/v1/admin/groups/all");
  const list = Array.isArray(data) ? data : (data?.groups || data?.items || data?.data || []);
  if (!Array.isArray(list)) throw new Error("sub2api 分组接口返回格式异常。");
  return list.map((item) => ({
    id: Number(item.id),
    name: String(item.name || item.id),
    platform: String(item.platform || ""),
    rate_multiplier: item.rate_multiplier,
    status: String(item.status || ""),
    subscription_type: String(item.subscription_type || ""),
  })).filter((g) => Number.isFinite(g.id));
}

function resolveSingleLocalGroupPlatform(groups, ids) {
  const byId = new Map((groups || []).map((group) => [Number(group.id), group]));
  const platforms = [];
  for (const id of ids || []) {
    const group = byId.get(Number(id));
    if (!group) throw new HttpError(400, `本地分组 ${id} 不存在，请刷新本地分组后重试。`);
    const platform = normalizeAccountPlatform(group.platform);
    if (!platform) throw new HttpError(400, `本地分组 ${group.name || id} 没有平台信息，请先在 sub2api 设置分组平台。`);
    if (!platforms.includes(platform)) platforms.push(platform);
  }
  if (platforms.length > 1) throw new HttpError(400, `所选本地分组平台不一致：${platforms.join("、")}，请只选择同平台分组。`);
  return platforms[0] || "";
}

async function sub2apiRequest(config, env, method, path, payload) {
  const baseUrl = normalizeSiteUrl(config.sub2api?.baseUrl || DEFAULT_SUB2API_BASE_URL);
  const adminApiKeyEncrypted = config.sub2api?.adminApiKey || "";
  if (!adminApiKeyEncrypted) throw new HttpError(400, "请先保存 sub2api 管理员 API Key。");
  const adminApiKey = await decryptSecret(adminApiKeyEncrypted, env);
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": adminApiKey,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });
  } catch (error) {
    throw new HttpError(502, `sub2api 请求失败：${method} ${url} 无法连接：${error?.message || String(error)}`);
  }
  const text = await res.text();
  const parsed = text ? safeJsonParse(text) : null;
  if (!res.ok) {
    const detail = formatApiError(parsed || text);
    throw new HttpError(502, `sub2api 请求失败：${method} ${url} 返回 HTTP ${res.status}${detail ? `: ${detail}` : ""}`);
  }
  if (parsed && typeof parsed === "object" && "data" in parsed && Object.keys(parsed).some((k) => ["success", "code", "message"].includes(k))) {
    return parsed.data;
  }
  return parsed;
}

function normalizeApiBase(siteUrl) {
  const normalized = normalizeSiteUrl(siteUrl).replace(/\/+$/, "");
  if (/\/api\/v1$/i.test(normalized)) return normalized;
  if (/\/api$/i.test(normalized)) return `${normalized}/v1`;
  return `${normalized}/api/v1`;
}

function compareGroups(previous, current) {
  const prevById = new Map((previous || []).map((g) => [String(g.id), g]));
  const currentById = new Map((current || []).map((g) => [String(g.id), g]));
  const added = [];
  const removed = [];
  const changed = [];
  for (const group of current || []) {
    const old = prevById.get(String(group.id));
    if (!old) {
      added.push(group.id);
      continue;
    }
    const rateChanged = String(old.rate_multiplier) !== String(group.rate_multiplier)
      || String(old.base_rate_multiplier || "") !== String(group.base_rate_multiplier || "")
      || String(old.user_rate_multiplier || "") !== String(group.user_rate_multiplier || "");
    if (rateChanged || String(old.status) !== String(group.status) || String(old.name) !== String(group.name) || String(old.description || "") !== String(group.description || "")) {
      changed.push({
        id: group.id,
        before: old,
        after: group,
        fields: {
          rate_multiplier: rateChanged,
          status: String(old.status) !== String(group.status),
          name: String(old.name) !== String(group.name),
          description: String(old.description || "") !== String(group.description || ""),
        },
      });
    }
  }
  for (const group of previous || []) {
    if (!currentById.has(String(group.id))) removed.push(group.id);
  }
  return { added, removed, changed };
}

async function loadConfig(env) {
  const raw = await env.MONITOR_DATA.get(CONFIG_KEY, "json");
  const config = deepMerge(DEFAULT_SETTINGS, raw || {});
  config.upstreams = Array.isArray(config.upstreams) ? config.upstreams : [];
  config.upstreams = config.upstreams.map((upstream) => ({
    ...upstream,
    hiddenGroupIds: Array.isArray(upstream.hiddenGroupIds) ? upstream.hiddenGroupIds : [],
    usedGroupIds: Array.isArray(upstream.usedGroupIds) ? upstream.usedGroupIds : [],
  }));
  config.sub2api = { ...DEFAULT_SETTINGS.sub2api, ...(config.sub2api || {}) };
  config.importDefaults = { ...DEFAULT_SETTINGS.importDefaults, ...(config.importDefaults || {}) };
  return config;
}

async function saveConfig(env, config) {
  await env.MONITOR_DATA.put(CONFIG_KEY, JSON.stringify(config));
}

function redactConfig(config) {
  return {
    ...config,
    sub2api: {
      ...config.sub2api,
      adminApiKey: config.sub2api?.adminApiKey ? "__SAVED__" : "",
      adminApiKeySaved: Boolean(config.sub2api?.adminApiKey),
    },
    upstreams: (config.upstreams || []).map((item) => ({
      ...item,
      token: item.token ? "__SAVED__" : "",
      tokenSaved: Boolean(item.token),
    })),
  };
}

function findUpstream(config, upstreamId) {
  const item = (config.upstreams || []).find((upstream) => upstream.id === upstreamId);
  if (!item) throw new HttpError(404, "上游不存在。");
  return item;
}

function sanitizeImportDefaults(raw) {
  const platform = normalizeAccountPlatform(raw.platform) || "openai";
  const modelMappingText = platform === "openai" ? String(raw.model_mapping_text ?? "").trim() : "";
  return {
    create_count: clampInt(raw.create_count, 1, 100),
    account_prefix: String(raw.account_prefix ?? "hc").trim() || "hc",
    base_url: String(raw.base_url ?? "").trim(),
    concurrency: clampInt(raw.concurrency, 0, 100000),
    load_factor: clampInt(raw.load_factor, 1, 10000),
    priority: clampInt(raw.priority, 0, 100000),
    group_priority: clampInt(raw.group_priority, 0, 100000),
    rate_multiplier_mode: raw.rate_multiplier_mode === "manual" ? "manual" : "upstream",
    rate_multiplier: String(raw.rate_multiplier ?? "").trim(),
    platform,
    type: String(raw.type ?? "upstream").trim() || "upstream",
    model_mapping_text: modelMappingText,
    notes: String(raw.notes ?? "").trim(),
  };
}

function arrayOfPositiveInts(value) {
  return (Array.isArray(value) ? value : []).map((v) => Number(v)).filter((v) => Number.isInteger(v) && v > 0);
}

function parseJsonObject(text, label) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  const parsed = safeJsonParse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new HttpError(400, `${label} 必须是 JSON 对象。`);
  return parsed;
}

function modelLooksLikePlatform(model, platform) {
  const id = String(model || "").trim().toLowerCase();
  const target = normalizeAccountPlatform(platform);
  if (!id || !target) return false;
  if (id === "*" || id.endsWith("*")) return true;
  if (target === "openai") return /^(gpt-|o[1345](?:-|$)|chatgpt-|codex-|dall-e-|text-embedding-|text-moderation-)/.test(id);
  if (target === "anthropic") return /^(claude-|anthropic\.)/.test(id);
  if (target === "gemini") return /^(gemini-|models\/gemini-|publishers\/google\/models\/gemini-)/.test(id);
  if (target === "antigravity") return /^(claude-|gemini-|models\/gemini-|publishers\/(google|anthropic)\/models\/)/.test(id);
  return false;
}

function shouldAttachModelMapping(platform, mapping) {
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) return false;
  const entries = Object.entries(mapping);
  if (!entries.length) return false;
  return entries.every(([from, to]) => modelLooksLikePlatform(from, platform) && modelLooksLikePlatform(to, platform));
}

async function encryptSecret(value, env) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await aesKey(env);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc(value));
  return `v1.${base64url(iv)}.${base64url(new Uint8Array(encrypted))}`;
}

async function decryptSecret(value, env) {
  const raw = String(value || "");
  if (!raw.startsWith("v1.")) return raw;
  const [, ivPart, dataPart] = raw.split(".");
  const key = await aesKey(env);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64urlDecode(ivPart) }, key, base64urlDecode(dataPart));
  return dec(new Uint8Array(decrypted));
}

async function aesKey(env) {
  const material = enc(env.ENCRYPTION_SECRET || "");
  if (material.byteLength < 16) throw new Error("Worker secret ENCRYPTION_SECRET 至少需要 16 字节。");
  const digest = await crypto.subtle.digest("SHA-256", material);
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

function autoKeyNameBase(upstreamUrl, rateMultiplier) {
  return `${domainLabel(upstreamUrl)}-${rateNamePart(rateMultiplier)}`;
}

function domainLabel(upstreamUrl) {
  try {
    const url = new URL(normalizeSiteUrl(upstreamUrl));
    const labels = url.hostname.toLowerCase().split(".").filter(Boolean);
    const comIndex = labels.indexOf("com");
    if (comIndex > 0) return sanitizeNamePart(labels[comIndex - 1]);
    if (labels.length >= 2) return sanitizeNamePart(labels[labels.length - 2]);
    return sanitizeNamePart(labels[0] || "upstream");
  } catch {
    return "upstream";
  }
}

function rateNamePart(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return sanitizeNamePart(value || "1");
  return String(num).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "") || "0";
}

function sanitizeNamePart(value) {
  return String(value || "upstream").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "upstream";
}

function findExistingAutoKeyMax(items, baseName) {
  let max = 0;
  const pattern = new RegExp(`^${escapeRegex(baseName)}-(\\d+)$`, "i");
  for (const item of items || []) {
    const name = String(item?.name || "");
    const match = name.match(pattern);
    if (match) max = Math.max(max, Number(match[1]) || 0);
  }
  return max;
}

function extractCreatedKey(data) {
  for (const field of ["key", "api_key", "token"]) {
    const value = data?.[field];
    if (typeof value === "string" && value.startsWith("sk-")) return value;
  }
  throw new Error("上游创建 key 成功，但响应里没有完整 API Key。");
}

function maskKey(key) {
  const raw = String(key || "");
  if (raw.length <= 16) return `${raw.slice(0, 4)}...`;
  return `${raw.slice(0, 8)}...${raw.slice(-6)}`;
}

function logLine(stage, message) {
  return { at: new Date().toISOString(), stage, message };
}

function upstreamFailure(upstream, error, extra = {}) {
  return {
    error: String(error || "未知错误").slice(0, 500),
    upstreamUrl: upstream.url,
    dashboardUrl: serverDashboardUrl(upstream.url),
    ...extra,
  };
}

function formatApiError(value) {
  if (typeof value === "string") return value.slice(0, 500);
  if (value && typeof value === "object") {
    return String(value.message || value.error || JSON.stringify(value)).slice(0, 500);
  }
  return String(value ?? "").slice(0, 500);
}

function firstText(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined) return value;
  }
  return undefined;
}

function normalizeAccountPlatform(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return "";
  if (raw === "claude") return "anthropic";
  return raw;
}

function validateAccountPlatform(platform) {
  if (["openai", "anthropic", "gemini", "antigravity"].includes(platform)) return;
  throw new HttpError(400, `暂不支持的平台：${platform || "空"}`);
}

function normalizeRateValue(value) {
  return String(value ?? "").replace(/[×x]/gi, "").trim();
}

function rateComparable(value) {
  const raw = normalizeRateValue(value);
  const number = Number(raw);
  return Number.isFinite(number) ? String(number) : raw;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function jwtMeta(token) {
  const parts = String(token || "").split(".");
  if (parts.length < 2) return { expiresAt: "", expired: false };
  try {
    const payload = safeJsonParse(dec(base64urlDecode(parts[1])));
    const exp = Number(payload?.exp);
    if (!Number.isFinite(exp)) return { expiresAt: "", expired: false };
    const expiresAt = new Date(exp * 1000).toISOString();
    return { expiresAt, expired: exp <= Math.floor(Date.now() / 1000) };
  } catch {
    return { expiresAt: "", expired: false };
  }
}

function normalizeSiteUrl(value) {
  let raw = String(value || "").trim();
  if (!raw) return "";
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  return raw.replace(/\/+$/, "");
}

function serverDashboardUrl(value) {
  try {
    const url = new URL(normalizeSiteUrl(value));
    url.pathname = "/dashboard";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return value || "";
  }
}

function clampInt(value, min, max) {
  const num = Math.trunc(Number(value));
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
}

function numberOrDefault(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : Number(fallback);
}

function deepMerge(base, overlay) {
  if (!overlay || typeof overlay !== "object") return structuredClone(base);
  const result = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    if (value && typeof value === "object" && !Array.isArray(value) && base?.[key] && typeof base[key] === "object" && !Array.isArray(base[key])) {
      result[key] = deepMerge(base[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "请求 JSON 格式不正确。");
  }
}

function parseCookies(header) {
  return Object.fromEntries(header.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return index === -1 ? [part, ""] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));
}

function json(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function enc(value) {
  return new TextEncoder().encode(value);
}

function dec(value) {
  return new TextDecoder().decode(value);
}

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64urlDecode(value) {
  const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function stableId(value) {
  return btoa(value).replace(/[^A-Za-z0-9]/g, "").slice(0, 18) || crypto.randomUUID().replace(/-/g, "").slice(0, 18);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
