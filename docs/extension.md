# 浏览器扩展文档

扩展用于自动读取各上游中转站页面里的：

```js
localStorage.getItem("auth_token")
```

然后通过监控页自己的 API 保存回 Worker KV。

## 1. 替换监控域名

编辑 `extension/manifest.json`，把所有：

```text
https://YOUR_MONITOR_DOMAIN/*
```

替换为你的监控域名，例如：

```text
https://monitor.example.com/*
```

如果你本地调试，也可以临时加入：

```json
"http://localhost:8788/*"
```

## 2. 安装扩展

Chrome / Edge：

1. 打开扩展管理页。
2. 开启“开发者模式”。
3. 点击“加载已解压的扩展”。
4. 选择项目的 `extension/` 目录。

## 3. 行为说明

### 自动静默同步

监控页打开后 6 秒检查一次，之后每 30 分钟检查一次。

自动同步不会主动打开上游网页，只会扫描已经打开的浏览器标签页。如果某个上游页面已经登录并打开，扩展会读取 token 并保存。

### 手动强制同步

监控页顶部会出现“同步 Token”按钮。

点击后，扩展会对所有上游执行同步。若浏览器里没有打开对应上游，它会临时在后台打开上游 `/dashboard`，读取 token 后关闭。

### 过期阈值

默认只同步 12 小时内过期或已过期的 token。你可以在监控页控制台修改：

```js
localStorage.setItem("token_sync_threshold_hours", "24")
```

## 4. 权限说明

`manifest.json` 默认包含：

```json
"host_permissions": [
  "https://YOUR_MONITOR_DOMAIN/*",
  "http://*/*",
  "https://*/*"
]
```

这是因为上游中转站域名可能很多，扩展需要在这些域名上执行脚本读取 `localStorage.auth_token`。

如果你的上游固定，可以缩小权限，例如：

```json
"host_permissions": [
  "https://monitor.example.com/*",
  "https://upstream-a.example.com/*",
  "https://upstream-b.example.com/*"
]
```

## 5. 常见问题

### 监控页没有出现“同步 Token”

检查：

- `manifest.json` 里的域名是否和监控页域名一致。
- 扩展是否重新加载。
- 当前页面是否已登录进入监控主界面。

### 提示未读取到 auth_token

说明对应上游没有登录，或上游没有把 token 存在 `localStorage.auth_token`。手动打开上游后台登录一次，再点击同步。

### 每次都打开上游页面

自动静默同步不会打开页面。只有点击“同步 Token”按钮时才会强制后台打开缺失的上游页面。

### 想改成别的 token 字段

编辑 `extension/background.js`：

```js
var token = localStorage.getItem("auth_token") || "";
```

改成你的上游实际字段名。

