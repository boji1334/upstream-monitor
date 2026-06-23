# 配置说明

## 页面配置项

### sub2api 服务器

| 字段 | 说明 |
| --- | --- |
| `base_url` | 你的 sub2api 管理后台地址，例如 `https://sub2api.example.com` |
| 管理员 API Key | 用于调用 `/api/v1/admin/*` 接口的 key |

管理员 API Key 会加密保存。输入框留空保存时会保留原值。

### 创建参数

这些参数用于“创建并导入”。

| 参数 | 说明 |
| --- | --- |
| `create_count` | 一次创建上游 key 的数量 |
| `priority` | 导入 sub2api 后账号优先级 |
| `concurrency` | 导入 sub2api 后账号并发 |
| `load_factor` | 导入 sub2api 后账号负载因子 |
| `platform` | 账号平台，通常会随上游分组/本地分组自动切换 |
| `type` | 账号类型，当前默认 `apikey` |
| `base_url` | 导入账号的上游 base URL，留空使用当前上游 URL |
| `rate_multiplier_mode` | `upstream` 使用上游倍率；`manual` 使用手动倍率 |
| `rate_multiplier` | 手动倍率，仅 `manual` 模式生效 |
| `model_mapping` | 模型映射 JSON 对象 |
| `notes` | 导入账号备注，留空使用上游 URL |

## model_mapping 平台保护

导入时会校验 `model_mapping` 是否和账号平台匹配：

- OpenAI：`gpt-*`、`o*`、`codex-*`、`gpt-image-*` 等。
- Anthropic：`claude-*`。
- Gemini：`gemini-*`。
- Antigravity：允许 `claude-*` 和 `gemini-*`。

如果当前平台是 Anthropic，但 `model_mapping` 里全是 GPT，会自动跳过，不会写入账号 credentials。

## 上游配置

每个上游保存：

| 字段 | 说明 |
| --- | --- |
| `id` | 自动生成 |
| `name` | 自定义名称 |
| `url` | 上游地址 |
| `token` | 加密后的上游 `auth_token` |
| `mark` | 自定义标记 |
| `snapshot` | 最近一次刷新结果 |
| `balance` | 最近一次余额读取结果 |
| `hiddenGroupIds` | 隐藏分组 ID 列表 |
| `usedGroupIds` | 标记已用分组 ID 列表 |

## KV 数据结构

KV binding：`MONITOR_DATA`

### `config:v1`

主配置，包含 sub2api、创建参数、上游列表。

### `history:v1`

倍率变化历史。

## 上游接口假设

项目默认假设上游提供以下 New API / sub2api 风格接口：

| 接口 | 用途 |
| --- | --- |
| `GET /api/v1/groups/available` | 读取可用分组 |
| `GET /api/v1/groups/rates` | 读取用户实际倍率，若没有会自动忽略 |
| `GET /api/v1/user/profile` | 读取余额 |
| `GET /api/v1/keys?page=1&page_size=100` | 读取已有 key，用于自动编号 |
| `POST /api/v1/keys` | 创建上游 key |

如果你的上游接口字段不一致，主要改 `worker/src/worker.js` 中这些函数：

- `fetchUpstreamGroups`
- `fetchUpstreamRateMap`
- `safeFetchUpstreamBalance`
- `fetchUpstreamKeys`
- `createUpstreamKey`
- `normalizeUpstreamGroups`

## sub2api 接口假设

项目默认调用：

| 接口 | 用途 |
| --- | --- |
| `GET /api/v1/admin/groups/all` | 读取本地分组 |
| `POST /api/v1/admin/accounts/batch` | 批量导入账号 |
| `POST /api/v1/admin/accounts/bulk-update` | 修正平台，当前按钮默认禁用 |

如果你的 sub2api 接口不同，改 `fetchSub2apiGroups`、`sub2apiRequest` 和 `handleCreateAndImport`。

