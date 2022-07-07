const path = require('path');
const devMode = process.env.NODE_ENV !== "production";
const releaseMode = process.env.BUILD_MODE == "release";
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ZipPlugin = require('zip-webpack-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const fs = require('fs');

module.exports = {
  entry: './src/index.js',
  devtool: devMode ? 'inline-source-map' : false,
  devServer: {
    static: './dist',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'WebRTCjs demo',
      template: 'src/index.html'
    }),
  ].concat((devMode && !releaseMode) ? [] : [new MiniCssExtractPlugin({
    filename: '[contenthash].[name].css'
  }), new ZipPlugin({
    filename: 'webrtcjs_v0.0.zip',
  }), new ReplaceInFileWebpackPlugin([{
    dir: './',
    files: ['README.md'],
    rules: [{
      search: /src="(.*)\.bundle\.js"/ig,
      replace: function(){
        return 'src="' + fs.readdirSync('./dist').find(value => /(.*)\.bundle\.js/.test(value)) + '"';
      }
    }]
  }])]),
  output: {
    filename: '[contenthash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'WebRTCjs',
      type: 'umd',
      export: 'default'
    },
    globalObject: 'this',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          (devMode && !releaseMode) ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ],
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  },
  optimization: {
    minimizer: [
      `...`,
      new CssMinimizerPlugin(),
    ],
  },
};
