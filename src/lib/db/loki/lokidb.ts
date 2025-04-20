import Loki from "lokijs";

const db = new Loki("chat.db", {
  autosave: true,
  autosaveInterval: 5000, // 自动保存每 5 秒执行一次
});

// 手动加载数据库
export const loadDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.loadDatabase({}, (err) => {
      if (err) {
        reject(err);
      } else {
        // 如果不存在消息集合，创建它
        if (!db.getCollection("messages")) {
          db.addCollection("messages");
        }
        resolve();
      }
    });
  });
};

// 手动保存数据库
export const saveDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.saveDatabase((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// 获取消息集合
export const getMessagesCollection = () => {
  return db.getCollection("messages");
};

export default db;
