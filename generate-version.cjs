// generate-version.js
const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');

// 获取当前日期时间作为版本号
const now = new Date();
const version = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

// 创建版本号文件
const versionFilePath = path.resolve(__dirname, 'public/version.js');
fs.writeFileSync(versionFilePath, `self.PWA_VERSION = '${version}';\n`, 'utf8');

// 创建版本号文件TS
const versionFilePathTs = path.resolve(__dirname, 'src/utils/version.ts');
fs.writeFileSync(versionFilePathTs, `export const PWA_VERSION = '${version}';\n`, 'utf8');

console.log(`Version ${version} generated and written to ${versionFilePath}`);

// 压缩并移动 sw.js 文件
const uglifyServiceWorker = () => {
    const inputFilePath = path.join(__dirname, 'src/app/utils/sw.js');
    const outputFilePath = path.join(__dirname, 'public/sw.js');

    try {
        const data = fs.readFileSync(inputFilePath, 'utf8');
        const result = UglifyJS.minify(data, {
            compress: true,
            mangle: {
                toplevel: true,
                reserved: ['self', 'importScripts', 'navigator', 'clients', 'caches', 'Response', 'fetch'],
            },
            output: {
                comments: false,
            },
        });

        if (result.error) {
            throw result.error;
        }

        fs.writeFileSync(outputFilePath, result.code, 'utf8');
        console.log('sw.js 文件已成功压缩并放置在 public 目录中');
    } catch (error) {
        console.error('压缩 sw.js 文件时出错:', error);
    }
};

uglifyServiceWorker

