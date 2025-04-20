'use client';

import React, { useEffect, useState } from "react";
import { getMessagesCollection, loadDatabase, saveDatabase } from "~/lib/db/loki/lokidb";

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [userName, setUserName] = useState<string>("User" + Math.floor(Math.random() * 1000));

  useEffect(() => {
    // 加载数据库并初始化消息
    loadDatabase()
      .then(() => {
        const messagesCollection = getMessagesCollection();
        if (messagesCollection) {
          setMessages(messagesCollection.find());
        }
      })
      .catch((err) => console.error("加载数据库失败：", err));
  }, []);

  // 发送消息
  const sendMessage = () => {
    if (!input.trim()) return;

    const messagesCollection = getMessagesCollection();
    if (messagesCollection) {
      messagesCollection.insert({
        id: Date.now().toString(),
        user: userName,
        text: input.trim(),
        timestamp: Date.now(),
      });
      setMessages(messagesCollection.find()); // 更新显示
      setInput(""); // 清空输入框

      // 保存数据库
      saveDatabase().catch((err) => console.error("保存数据库失败：", err));
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>基于 LokiJS 的 IM 聊天应用</h1>
      <div style={{ border: "1px solid #ddd", padding: "10px", height: "300px", overflowY: "scroll" }}>
        {messages.map((message) => (
          <div key={message.id} style={{ marginBottom: "10px" }}>
            <strong>{message.user}:</strong>
            <p>{message.text}</p>
            <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          placeholder="输入消息"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: "80%", padding: "8px", marginRight: "10px" }}
        />
        <button onClick={sendMessage} style={{ padding: "8px 12px" }}>
          发送
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
