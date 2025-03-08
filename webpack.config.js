const webpack = require("webpack")
const ejs = require("ejs")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const { VueLoaderPlugin } = require("vue-loader")
const { version } = require("./package.json")

const config = {
  mode: process.env.NODE_ENV,
  context: __dirname + "/src",
  entry: {
    background: "./background.ts",
    "popup/popup": "./popup/popup.ts",
    "options/options": "./options/options.ts",
    "logviewer/logviewer": "./logviewer/logviewer.ts",
    "statistics/statistics": "./statistics/statistics.ts",
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].js",
    publicPath: "/",
  },
  resolve: {
    extensions: [".js", ".ts", ".vue"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        // TypeScript をコンパイルする
        use: [
          {
            loader: "ts-loader",
            options: {
              appendTsSuffixTo: [/\.vue$/],
            },
          },
        ],
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.sass$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader?indentedSyntax",
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
          outputPath: "/images/",
          emitFile: true,
          esModule: false,
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
          outputPath: "/fonts/",
          emitFile: true,
          esModule: false,
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      global: "window",
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new CopyPlugin({
      patterns: [
        { from: "icons", to: "icons", globOptions: { ignore: ["icon.xcf"] } },
        {
          from: "popup/popup.html",
          to: "popup/popup.html",
          transform: transformHtml,
        },
        {
          from: "options/options.html",
          to: "options/options.html",
          transform: transformHtml,
        },
        {
          from: "logviewer/logviewer.html",
          to: "logviewer/logviewer.html",
          transform: transformHtml,
        },
        {
          from: "statistics/statistics.html",
          to: "statistics/statistics.html",
          transform: transformHtml,
        },
        { from: "_locales", to: "_locales", transform: transformHtml },
        {
          from: "manifest.json",
          to: "manifest.json",
          transform: (content) => {
            const jsonContent = JSON.parse(content)
            jsonContent.version = version

            if (config.mode === "development") {
              jsonContent["content_security_policy"] =
                "script-src 'self' 'unsafe-eval'; object-src 'self'"
            }

            return JSON.stringify(jsonContent, null, 2)
          },
        },
      ],
    }),
  ],
}

if (config.mode === "production") {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"',
      },
    }),
  ])
}

// HMR機能は現在無効化されています
// if (process.env.HMR === "true") {
//   config.plugins = (config.plugins || []).concat([
//     new ExtensionReloader({
//       manifest: __dirname + "/src/manifest.json",
//     }),
//   ])
// }

function transformHtml(content) {
  return ejs.render(content.toString(), {
    ...process.env,
  })
}

module.exports = config
