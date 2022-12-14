const path = require("path");
const GasPlugin = require("gas-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src", "index.ts"),
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: [ ".ts", ".js" ],
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [ new GasPlugin() ],
  optimization: {
    minimize: false,
  },
};
