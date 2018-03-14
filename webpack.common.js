const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');


module.exports = {
  entry: {
    app: './src/app/app.js'
  },
  // optimization: {
  //   splitChunks: {
  //     chunks: "all"
  //   }
  // },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: './src/app/index.html'
    }),
  ],
  output: {
    // filename: '[name].[chunkhash].js',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,  use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/, use: [ 'file-loader' ]
      },
      {
        test: /\.html$/,
        // exclude: /node_modules/,
        use: {loader: 'html-loader', options: {}}
      }
    ]
  }
};