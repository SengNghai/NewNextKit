"use client";

import { useState, useEffect } from "react";
import { pxToRem, getRealViewportHeight } from "~/lib/utils/common";
import styles from "./styles.module.scss";
import { Button } from "antd-mobile";

export default function Page() {
  // ✅ 初始值设定为 `null`，确保 SSR 渲染不影响 HTML 结构
  const [realHeight, setRealHeight] = useState<number | null>(null);

  // ✅ 获取真实可用高度
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateHeight = () => {
        setRealHeight(getRealViewportHeight()); // ✅ 获取真实可用高度
      };

      updateHeight(); // ✅ 页面加载时立即计算真实高度
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }
  }, []);

  return (
    <div className={styles.mobile}>
      <div className={styles.header} style={{  position: "sticky", top: 0, zIndex: 1000, backgroundColor: "pink", width: "100%"}}>
        header
      </div>

      {/* ✅ 仅在浏览器环境渲染 `content`，避免 SSR 错误 */}
      <div className={styles.content} >
          <div>
            <p>{realHeight}</p>
            <Button color="primary" style={{ width: pxToRem(200), height: pxToRem(50), fontSize: pxToRem(16) }}>Button</Button>
          </div>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-</p>
          <p>content-我到底了</p>
        </div>

      <div className={styles.footer} style={{ position: "sticky", bottom: 0, zIndex: 1000, backgroundColor: "pink", width: "100%" }}>
        footer
      </div>
    </div>
  );
}
