const path = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");

const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const baseConfig = (dirPath) => ({
  // https://webpack.js.org/configuration/devtool/
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    path: path.resolve(dirPath, "../www", "assets/js/"),
    filename: "[contenthash:12].js",
    chunkFilename: "[chunkhash:12].js",
  },
  performance: { hints: false },
  optimization: {
    sideEffects: true,
    // https://webpack.js.org/plugins/split-chunks-plugin/
    splitChunks: {
      chunks: "all",
      maxSize: 600000,
      minChunks: 5,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          babelrc: false,
          presets: ["@babel/preset-env", "@babel/preset-react"],
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 50000,
          },
        },
      },
      {
        test: /\.less$/i,
        loader: "less-loader",
      },
      {
        test: /\.(png|jp(e*)g|svg|md)$/,
        use: [
          {
            loader: "url-loader",
          },
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              severityError: "warning",
              minimizerOptions: {
                plugins: [
                  ["optipng", { optimizationLevel: 3 }],
                  [
                    "svgo",
                    {
                      plugins: [
                        {
                          removeViewBox: false,
                        },
                      ],
                    },
                  ],
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /pt-br/),
    new ProgressBarPlugin({
      format: "Build [:bar] :percent (:elapsed seconds)",
      clear: false,
    }),
  ],
  // https://webpack.js.org/configuration/resolve/#resolvealias
  resolve: {
    alias: {
      components: path.resolve(dirPath, "../src/components/index.js"),
      containers: path.resolve(dirPath, "../src/containers/index.js"),
      providers: path.resolve(dirPath, "../src/providers/index.js"),
      hooks: path.resolve(dirPath, "../src/hooks/index.js"),
      utils: path.resolve(dirPath, "../src/utils/index.js"),
    },
  },
});

const prodConfig = (dirPath) => ({
  mode: "production",
  output: {
    publicPath: "assets/js/",
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
      cleanOnceBeforeBuildPatterns: [path.join(dirPath, "../www/assets/**/*")],
    }),
    new HtmlWebpackPlugin({
      template: "src/index.html",
      filename: "../../index.html",
      showErrors: true,
      chunksSortMode: "auto",
      minify: {
        removeComments: false,
        collapseWhitespace: true,
        useShortDoctype: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new Dotenv({
      path: path.join(dirPath, `/.env.prod`),
      safe: true,
      systemvars: true,
    }),
    new CopyPlugin({
      patterns: [{ from: "src/assets/img/", to: "../img/" }],
    }),
    new CompressionPlugin({
      test: /\.js$/,
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
      reportFilename: "../../analyzer.html",
    }),
  ],
});

const devConfig = (dirPath) => ({
  mode: "development",
  output: {
    publicPath: "/",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
      filename: "index.html",
      showErrors: true,
      chunksSortMode: "auto",
      minify: {
        removeComments: false,
        collapseWhitespace: true,
        useShortDoctype: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new Dotenv({
      path: path.join(dirPath, `/.env.dev`),
      safe: true,
      systemvars: true,
    }),
  ],
  devServer: {
    contentBase: path.join(dirPath, "../../../www/"),
    index: "index.html",
    compress: true,
    open: true,
    port: 9090,
    hot: true,
    historyApiFallback: true,
  },
});

module.exports = (options = {}, dirPath) => (env) =>
  merge(
    baseConfig(dirPath),
    env.dev ? devConfig(dirPath) : prodConfig(dirPath),
    options
  );
