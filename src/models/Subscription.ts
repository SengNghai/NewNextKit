import mongoose, { Schema, Document } from 'mongoose';


/*
定义数据模型
在项目的 models 文件夹中创建一个模型文件（例如 models/Subscription.ts），用于描述订阅数据的结构。
*/
interface IPushSubscription extends Document {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const SubscriptionSchema = new Schema<IPushSubscription>({
  endpoint: { type: String, required: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
});

export default mongoose.models.Subscription || mongoose.model<IPushSubscription>('Subscription', SubscriptionSchema);
