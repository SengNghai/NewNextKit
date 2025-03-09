"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";

export default function MobilePage() {
  const [message, setMessage] = useState(""); // 消息输入内容
  const inputRef = useRef<HTMLInputElement | null>(null); // 引用输入框
  const containerRef = useRef<HTMLDivElement | null>(null); // 引用整个页面容器

  useEffect(() => {
    const handleKeyboardShow = () => {
      const activeElement = document.activeElement as HTMLElement;

      // 如果输入框被遮挡，将页面向上滚动
      if (activeElement && containerRef.current) {
        const offset = activeElement.getBoundingClientRect().bottom - window.innerHeight;
        if (offset > 0) {
          containerRef.current.style.transform = `translateY(-${offset + 20}px)`; // 推动页面
        }
      }
    };

    const handleKeyboardHide = () => {
      if (containerRef.current) {
        containerRef.current.style.transform = "translateY(0px)"; // 恢复页面位置
      }
    };

    // 监听键盘事件
    window.addEventListener("resize", () => {
      const isKeyboardVisible = window.innerHeight < document.documentElement.clientHeight;
      if (isKeyboardVisible) {
        handleKeyboardShow();
      } else {
        handleKeyboardHide();
      }
    });

    return () => {
      window.removeEventListener("resize", handleKeyboardShow);
      window.removeEventListener("resize", handleKeyboardHide);
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
    <div
      ref={containerRef}
      style={{
        padding: "20px",
        transition: "transform 0.3s ease-in-out", // 添加平滑过渡效果
      }}
    >
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
