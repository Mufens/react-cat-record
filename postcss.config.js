module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 1920, // 设计稿宽度
      viewportHeight: 1080, // 设计稿高度
      unitPrecision: 3, // 转换后的精度，即小数点位数
      viewportUnit: 'vw', // 指定需要转换成的视窗单位，默认vw
      selectorBlackList: ['.ignore', '.hairlines'], // 指定不转换为视窗单位的类，可以自定义，可以无限添加,建议定义一至两个通用的类名
      minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
      mediaQuery: false, // 允许在媒体查询中转换`px`
      exclude: [/node_modules/], // 设置忽略文件，用正则做目录名匹配
      landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
      landscapeUnit: 'vw', // 横屏时使用的单位
      landscapeWidth: 1920 // 横屏时使用的视口宽度
    }
  }
}
