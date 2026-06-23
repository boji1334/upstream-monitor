# 部署文档

## 1. Cloudflare 准备

你需要一个已经接入 Cloudflare 的域名，例如 `example.com`，准备一个子域名，例如：

```text
monitor.example.com
```

创建 Cloudflare API Token 时建议授予：

- Account / Workers Scripts / Edit
- Account / Workers KV Storage / Edit
- Zone / Workers Routes / Edit
- Zone / DNS / Edit
- Zone / Zone / Read

## 2. 安装依赖

```powershell
npm install
```

## 3. 一键部署

```powershell
$env:CLOUDFLARE_API_TOKEN="你的 Cloudflare API Token"
.\scripts\deploy-worker.ps1 `
  -ZoneName "example.com" `
  -RoutePattern "monitor.example.com/*" `
  -WorkerName "upstream-monitor" `
  -KvNamespaceTitle "upstream_monitor_data" `
  -AdminUser "admin"
```

脚本会询问管理员密码。如果不想交互，可以传入：

```powershell
.\scripts\deploy-worker.ps1 `
  -ZoneName "example.com" `
  -RoutePattern "monitor.example.com/*" `
  -AdminUser "admin" `
  -AdminPassword "change-this-password" `
  -EncryptionSecret "change-this-secret-at-least-16-bytes"
```

`EncryptionSecret` 用于加密 KV 里的上游 token 和 sub2api admin key。上线后不要随便更换。

## 4. 手动部署

如果不使用脚本，也可以手动做：

1. 创建 KV namespace。
2. 复制 `worker/wrangler.example.jsonc` 为 `worker/wrangler.jsonc`。
3. 修改：
   - `name`
   - `routes[0].pattern`
   - `routes[0].zone_name`
   - `kv_namespaces[0].id`
4. 写入 secrets：

```powershell
npx wrangler secret put ADMIN_USER --config worker/wrangler.jsonc
npx wrangler secret put ADMIN_PASSWORD --config worker/wrangler.jsonc
npx wrangler secret put ENCRYPTION_SECRET --config worker/wrangler.jsonc
```

5. 部署：

```powershell
npx wrangler deploy --config worker/wrangler.jsonc
```

## 5. 首次配置

打开监控页并登录后：

1. 在“sub2api 服务器”填写 `base_url`，例如 `https://sub2api.example.com`。
2. 填写 sub2api 管理员 API Key。
3. 点击“保存服务器”。
4. 添加一个上游 URL 和该上游的 `auth_token`。
5. 点击“刷新全部”。

## 6. Cloudflare Worker Secrets

| 名称 | 用途 |
| --- | --- |
| `ADMIN_USER` | 监控页登录账号，默认可用 `admin` |
| `ADMIN_PASSWORD` | 监控页登录密码 |
| `ENCRYPTION_SECRET` | AES-GCM 加密密钥，至少 16 字节 |

## 7. KV 数据

KV binding 必须叫：

```text
MONITOR_DATA
```

保存的数据包括：

- 监控配置
- 上游列表
- 加密后的上游 token
- 加密后的 sub2api admin key
- 倍率变化历史
- 隐藏分组、已用分组、上游标记

## 8. 常见部署错误

### 401 请先登录

说明 session 无效，重新登录即可。

### Worker secret ADMIN_PASSWORD is not configured

没有设置 `ADMIN_PASSWORD`：

```powershell
npx wrangler secret put ADMIN_PASSWORD --config worker/wrangler.jsonc
```

### Worker secret ENCRYPTION_SECRET 至少需要 16 字节

`ENCRYPTION_SECRET` 太短，重新设置一个更长的随机字符串。

### sub2api 请求失败 HTTP 502

常见原因：

- sub2api 地址填错。
- sub2api admin key 填错。
- sub2api 服务器拦截了 Cloudflare Worker 的请求。
- sub2api 后台接口路径和本项目预期不一致。

