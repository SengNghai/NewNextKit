"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";

export default function MobilePage() {
  const [message, setMessage] = useState(""); // 消息输入内容
  const inputRef = useRef<HTMLInputElement | null>(null); // 引用输入框

  useEffect(() => {
    // 监听键盘弹出和收起事件（通过 window resize 判断）
    const handleResize = () => {
      const isKeyboardVisible = window.innerHeight < document.documentElement.clientHeight;
      if (isKeyboardVisible) {
        console.log("键盘弹出");
      } else {
        console.log("键盘收起");
      }
    };

    window.addEventListener("resize", handleResize);

    // 清除事件监听器
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSend = () => {
    if (message.trim() !== "") {
      console.log("发送的消息:", message);

      // 发送信息后不清除焦点，键盘保持打开状态
      if (inputRef.current) {
        inputRef.current.focus();
      }

      // 清空输入框
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
         <div>
          <Link href="/">移动端</Link>
        </div>
      <h1>Mobile Page</h1>
      <div style={{ marginBottom: "10px" }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="请输入消息"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => console.log("键盘弹出")}
          onBlur={() => console.log("键盘收起")}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />
      </div>
      <button
        onClick={handleSend}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        发送
      </button>
    </div>
  );
}
