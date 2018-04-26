const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DelWebpackPlugin = require('del-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  // mode: 'development',
  entry: {
    app: './src/app/app.js',

  },
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  plugins: [
    new DelWebpackPlugin({
      info: true,
      exclude: ['vendors*.js']
    }),
    new HtmlWebpackPlugin({
      template: './src/app/index.html'
    }),
    new WebpackMd5Hash(),
    new MiniCssExtractPlugin({
      filename: 'style.[contenthash].css',
    }),
  ],
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      // { test: /\.(scss)$/,
      //   use: [{ loader: 'style-loader', },
      //         { loader: 'css-loader',  },
      //         { loader: 'postcss-loader',
      //           options: {
      //             plugins: function () { // post css plugins, can be exported to postcss.config.js
      //               return [require('precss'), require('autoprefixer') ];
      //             }
      //           }
      //         },
      //         { loader: 'sass-loader' }]
      // },
      { test: /\.(scss)$/,
        use: ['style-loader', MiniCssExtractPlugin.loader,'css-loader',
              { loader: 'postcss-loader',
                options: {
                  plugins: function () { // post css plugins, can be exported to postcss.config.js
                    return [require('precss'), require('autoprefixer') ];
                  }
                }
              },
              'sass-loader'
            ]
      },
      { test: /\.less$/, use: [{loader: "style-loader"}, {loader: "css-loader"}, {loader: "less-loader"}] },
      { test: /\.css$/,  use: [ 'style-loader', 'css-loader' ] },
      { test: /\.(png|svg|jpg|gif)$/, use: [ 'file-loader' ] },
      { test: /\.html$/, use: {loader: 'html-loader', options: {} }
        // , exclude: /node_modules/
      },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
    ]
  },
  resolve: {
    extensions: ['.js', '.css', '.html'],
    modules:['src', 'node_modules']
  }
};