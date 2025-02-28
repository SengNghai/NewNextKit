## 调用方式
- 在客户端，你可以通过 fetch 调用这些 API 接口。例如：

## 订阅用户:

```javascript
fetch('/api/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(subscription),
});

```
## 取消订阅:

```javascript
fetch('/api/unsubscribe', { method: 'POST' });
```
## 发送通知:

```javascript
fetch('/api/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello, World!' }),
});

通过这种方式，代码被组织到独立的 API 路由中，便于维护和扩展。如果有其他需求，欢迎随时告诉我！
```