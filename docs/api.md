# Worker API

所有 `/api/*` 接口除 `/api/login`、`/api/logout`、`/api/session` 外都需要登录 cookie。

## 登录

### `POST /api/login`

请求：

```json
{
  "username": "admin",
  "password": "password"
}
```

成功后写入 HttpOnly session cookie。

### `POST /api/logout`

清除 session cookie。

### `GET /api/session`

返回：

```json
{
  "authenticated": true
}
```

## 配置

### `GET /api/config`

返回脱敏后的配置。`token` 和 `adminApiKey` 不会明文返回，只返回 `__SAVED__` 和 saved 标记。

### `PUT /api/config`

可更新 sub2api 配置和创建参数。

```json
{
  "sub2api": {
    "baseUrl": "https://sub2api.example.com",
    "adminApiKey": "admin-key"
  },
  "importDefaults": {
    "create_count": 10,
    "platform": "anthropic",
    "type": "apikey"
  }
}
```

## 上游

### `POST /api/upstreams`

添加上游：

```json
{
  "name": "upstream-a",
  "url": "https://upstream.example.com",
  "token": "jwt-auth-token"
}
```

### `PATCH /api/upstreams/:id`

修改上游：

```json
{
  "name": "new name",
  "mark": "特殊",
  "token": "new-token"
}
```

### `DELETE /api/upstreams/:id`

删除监控记录，不会删除上游网站。

### `POST /api/upstreams/:id/refresh`

刷新单个上游的分组和余额。

### `POST /api/refresh`

刷新全部上游。

## 分组记录

### `POST /api/upstreams/:id/groups/:groupId/hide`

隐藏该分组记录。

### `POST /api/upstreams/:id/groups/:groupId/restore`

恢复隐藏分组。

### `POST /api/upstreams/:id/groups/:groupId/used`

标记该分组已用。

### `DELETE /api/upstreams/:id/groups/:groupId/used`

取消已用标记。

## sub2api

### `GET /api/sub2api/groups`

读取本地 sub2api 分组。

### `POST /api/create-import`

在上游创建 key 并导入到 sub2api。

```json
{
  "upstream_id": "upstream-id",
  "upstream_group_id": 13,
  "local_group_ids": [31],
  "settings": {
    "create_count": 10,
    "platform": "anthropic",
    "type": "apikey",
    "rate_multiplier_mode": "upstream"
  }
}
```

## 历史

### `GET /api/history`

获取倍率变化历史。

### `DELETE /api/history`

清空倍率变化历史。

