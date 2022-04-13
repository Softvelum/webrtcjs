const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  devtool: 'inline-source-map', //todo remove for production
  devServer: {
    static: './dist',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'WebRTCjs demo',
      template: 'src/index.html'
    }),
  ],
  output: {
    // library: "WebRTCjs",
    // libraryTarget: "var",
    // globalObject: 'this',
    filename: '[contenthash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'WebRTCjs',
      type: 'umd',
    },
    clean: true,
  },
};
