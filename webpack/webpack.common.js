const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, '../dist'), //`__dirname` 表示当前 webpack 配置文件所在的目录。`../dist` 回到项目根目录再生成
    filename: 'js/[name].js',
    assetModuleFilename: 'assets/[hash][ext][query]',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
    alias: {
      '@': path.resolve(__dirname, '../src')
    },
    fallback: {
      react: require.resolve('react'),
      'react-dom': require.resolve('react-dom')
    }
  },
  module: {
    rules: [
      // JS/TS 文件由 babel-loader 处理
      {
        test: /\.[jt]sx?$/,
        exclude: [/node_modules/, /src\/mock/],
        use: 'babel-loader'
      },
      // 图片等资源
      {
        test: /\.(png|jpg|jpeg|svg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
}
