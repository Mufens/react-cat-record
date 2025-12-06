const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader', // 将 CSS 注入 <head>
          'css-loader' // 解析 CSS
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              api: 'modern',
              sassOptions: {
                silenceDeprecations: ['legacy-js-api']
              }
            }
          }
        ]
      }
    ]
  },
  devServer: {
    static: './public',
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true
  }
})
