# 二开说明

## 技术结构

这个项目刻意保持轻量：

- 前端 HTML/CSS/JS 直接内嵌在 `worker/src/worker.js` 的 `APP_HTML` 中。
- 后端 API 也在同一个 Worker 文件里。
- 数据存在 Cloudflare KV。
- 浏览器扩展是 Chrome Manifest V3。

没有前端构建链，因此部署简单，二开时也不会被框架绑住。

## 常改位置

### 改页面样式

编辑：

```text
worker/src/worker.js
```

搜索：

```js
const APP_HTML = String.raw`
```

CSS 和前端 JS 都在这个模板字符串里。

### 改上游接口适配

主要函数：

- `fetchUpstreamGroups`
- `normalizeUpstreamGroups`
- `fetchUpstreamRateMap`
- `normalizeGroupRateMap`
- `safeFetchUpstreamBalance`
- `extractBalance`
- `fetchUpstreamKeys`
- `createUpstreamKey`

如果你的上游接口字段名不同，通常只需要改 normalize/extract 函数。

### 改 sub2api 适配

主要函数：

- `fetchSub2apiGroups`
- `sub2apiRequest`
- `handleCreateAndImport`
- `resolveSingleLocalGroupPlatform`

如果你的 sub2api 批量导入接口字段不同，改 `accounts` 对象构造即可。

### 改平台颜色

前端 CSS：

```css
.platform-tag.openai
.platform-tag.anthropic
.platform-tag.gemini
.platform-tag.antigravity
```

前端 JS：

```js
function platformKind(p)
```

### 改模型映射平台判断

后端函数：

```js
function modelLooksLikePlatform(model, platform)
function shouldAttachModelMapping(platform, mapping)
```

## 本地检查

```powershell
npm run check
```

## 本地运行

```powershell
Copy-Item worker\.dev.vars.example worker\.dev.vars
Copy-Item worker\wrangler.example.jsonc worker\wrangler.jsonc
npm run dev
```

## 发布前检查

建议执行：

```powershell
npm run check
rg -n "your-real-domain|server-password|auth_token\\s*[:=]|cloudflare-api-token|ADMIN_PASSWORD" .
```

不要把真实 `auth_token`、Cloudflare API Token、服务器密码、sub2api admin key 提交到 GitHub。

## 打包

PowerShell：

```powershell
Compress-Archive -Path upstream-monitor-github\* -DestinationPath upstream-monitor-github.zip -Force
```
