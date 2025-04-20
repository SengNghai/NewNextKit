export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}


/**
* 动态计算 `root font-size`，适配所有设备
* @param pageWidth 设计稿宽度（默认 750）
* @param baseSize 设计稿的 `1rem`（默认 100）
*/
export const setRemBase = (pageWidth = 750, baseSize = 100) => {

  const updateFontSize = () => {
    const html = document.documentElement;
    let fontSize = (baseSize * html.clientWidth) / pageWidth;
    html.style.fontSize = `${fontSize}px`;

    // ✅ 修复 WebKit 字体缩放问题
    const computedFontSize = parseFloat(getComputedStyle(html).fontSize);
    if (fontSize !== computedFontSize) {
      fontSize = (fontSize * fontSize) / computedFontSize;
      html.style.fontSize = `${fontSize}px`;
    }
  };

  updateFontSize(); // ✅ 页面加载时立即计算字体大小

  window.addEventListener("resize", () => {
    requestAnimationFrame(updateFontSize); // ✅ 替代 `setTimeout`，确保无延迟优化
  });
};

/**
 * 计算 `px` → `rem`，确保适配 `html` 的 `font-size`
 * @param px 需要转换的 `px` 值
 * @returns 返回 `rem` 单位字符串
 */
export const pxToRem = (px: number) => {
  if (typeof window !== "undefined" && document.documentElement) {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return `${px / rootFontSize}rem`;
  }
  return `${px / 100}rem`; // ✅ SSR 环境时默认使用 `100px`
};


/**
* 获取真实的视口高度
* @returns number
*/
export const getRealViewportHeight = (): number => {
  // 处理 iOS Safari 特殊情况 (避免地址栏遮挡)
  if (window.visualViewport) {
    return window.visualViewport.height;
  }

  // 处理移动端浏览器
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
  let viewportHeight = window.innerHeight;

  if (isMobile) {
    // 处理 iOS
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      viewportHeight = window.screen.height - (window.outerHeight - window.innerHeight);
    }
    // 处理 Android
    else if (/Android/i.test(navigator.userAgent)) {
      viewportHeight = window.innerHeight;
    }
  }

  return viewportHeight;
};

