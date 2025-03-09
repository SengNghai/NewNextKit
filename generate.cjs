// generate-version.js
const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');

//==========================提取当前版本号并递增======================================
// 获取 package.json 的路径
const packageJsonPath = path.resolve(__dirname, "package.json");

// 读取 package.json
fs.readFile(packageJsonPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading package.json:", err);
    return;
  }
  try {
    const packageJson = JSON.parse(data);

    // 提取当前版本号并递增
    const versionParts = packageJson.version.split(".").map(Number);
    versionParts[2] += 1; // 递增 patch 版本号，例如 1.0.0 -> 1.0.1
    packageJson.version = versionParts.join(".");

    // 写回更新后的 package.json
    fs.writeFile(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      (writeErr) => {
        if (writeErr) {
          console.error("Error writing package.json:", writeErr);
        } else {
          console.log(`Version bumped to ${packageJson.version}`);
        }
      },
    );
  } catch (parseErr) {
    console.error("Error parsing package.json:", parseErr);
  }
});

//==========================压缩并移动 sw.js 文件======================================
const uglifyServiceWorker = () => {
  const inputFilePath = path.join(__dirname, "src/lib/sw.js");
  const outputFilePath = path.join(__dirname, "public/sw.js");

  try {
    const data = fs.readFileSync(inputFilePath, "utf8");
    const result = UglifyJS.minify(data, {
      compress: true,
      mangle: {
        toplevel: true,
        reserved: [
          "self",
          "importScripts",
          "navigator",
          "clients",
          "caches",
          "Response",
          "fetch",
        ],
      },
      output: {
        comments: false,
      },
    });

    if (result.error) {
      throw result.error;
    }

    fs.writeFileSync(outputFilePath, result.code, "utf8");
    console.log("sw.js 文件已成功压缩并放置在 public 目录中");
  } catch (error) {
    console.error("压缩 sw.js 文件时出错:", error);
  }
};

uglifyServiceWorker();