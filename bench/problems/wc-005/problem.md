# wc-005: useApi 调用失败时错误不向调用方抛出

## 现象
用 useApi 封装的请求失败时，虽然内部记录了 error，但调用 execute 的一方无法通过 try/catch / .catch 感知失败——execute 静默成功返回。

## 期望
当被封装函数抛错时，execute 应在设置 error 后**重新抛出**该错误，让调用方可以用 await/catch 感知失败。
