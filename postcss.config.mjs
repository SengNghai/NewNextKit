const config = {
  plugins: [
    "@tailwindcss/postcss",
    [
      "postcss-px-to-viewport",
      {
        unitToConvert: "px", // 需要转换的单位，默认为"px"
        viewportWidth: 750, // 设计稿的视口宽度
        unitPrecision: 5, // 单位转换后保留的精度
        propList: ["*"], // 能转化为vw的属性列表
        viewportUnit: "vw", // 希望使用的视口单位
        fontViewportUnit: "vw", // 字体使用的视口单位
        selectorBlackList: [".ignore", ".hairlines"], // 需要忽略的CSS选择器，不会转为视口单位
        minPixelValue: 1, // 设置最小的转换数值
        mediaQuery: false, // 媒体查询里的单位是否需要转换单位
        replace: true, // 是否直接更换属性值，而不添加备用属性
        exclude: undefined, // 忽略某些文件夹下的文件或特定文件
        include: undefined, // 如果设置了include，那将只有匹配到的文件才会被转换
        landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件
        landscapeUnit: "vw", // 横屏时使用的单位
        landscapeWidth: 1920, // 横屏时使用的视口宽度
      },
    ]
  ],
};

export default config;
