# 上游 Token 自动同步扩展

这是监控面板的可选浏览器扩展，用于读取上游中转站页面里的 `localStorage.auth_token` 并同步回监控面板。

## 安装前必须修改

打开 `manifest.json`，把：

```text
https://YOUR_MONITOR_DOMAIN/*
```

替换为你的监控面板域名，例如：

```text
https://monitor.example.com/*
```

也可以在项目根目录运行：

```powershell
.\scripts\set-extension-domain.ps1 -MonitorUrl "https://monitor.example.com"
```

## 安装

1. 打开 Chrome/Edge 扩展管理页。
2. 开启开发者模式。
3. 点击“加载已解压的扩展”。
4. 选择本 `extension/` 目录。

## 行为

- 自动静默同步：只读取已经打开并登录的上游标签页。
- 手动强制同步：点击监控页顶部“同步 Token”，会临时后台打开上游 `/dashboard` 读取 token，然后自动关闭。
- 默认只同步 12 小时内过期或已经过期的 token。

