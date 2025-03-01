## 调用方式
- 在客户端，你可以通过 fetch 调用这些 API 接口。例如：

## 订阅用户:

```sh
步骤 7: 测试项目
启动开发服务器：

bash
npm run dev
使用客户端调用 API 路由进行测试，例如：

订阅用户：

fetch('/api/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(subscription),
});
取消订阅：

fetch('/api/unsubscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ endpoint: subscription.endpoint }),
});
发送通知：

fetch('/api/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello World!' }),
});
通过这一步步实现，你就能够将 MongoDB 集成到你的 Next.js项目中，轻松存储和管理订阅信息。如果遇到任何问题，随时告诉我！
```