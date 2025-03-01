// generate-version.js
const fs = require('fs');
const path = require('path');

// 获取当前日期时间作为版本号
const now = new Date();
const version = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

// 创建版本号文件
const versionFilePath = path.resolve(__dirname, 'public/version.js');
fs.writeFileSync(versionFilePath, `self.PWA_VERSION = '${version}';\n`, 'utf8');

console.log(`Version ${version} generated and written to ${versionFilePath}`);
