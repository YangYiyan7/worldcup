# wc-004: 后端返回失败时前端仍当成功处理

## 现象
调用用户列表/用户操作接口时，若后端在 payload 里返回 `success:false` 表示业务失败，前端仍把它当作成功返回，UI 不显示错误。

## 期望
当接口 payload 的 `success` 为 false 时，应抛出错误（带上 `message`，缺省 "Failed to fetch users"），而不是把失败当成功。
