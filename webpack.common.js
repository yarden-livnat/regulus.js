const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CleanCSSPlugin = require("less-plugin-clean-css");

module.exports = {
  entry: {
    app: './src/app/app.js',

  },
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  // mode: development,
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: './src/app/index.html'
    }),
  ],
  output: {
    filename: '[name].[chunkhash].js',
    // filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
      { test: /\.css$/,  use: [ 'style-loader', 'css-loader' ] },
      { test: /\.(png|svg|jpg|gif)$/, use: [ 'file-loader' ] },
      { test: /\.html$/, use: {loader: 'html-loader', options: {} }
        // , exclude: /node_modules/
      },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
    ]
  }
};