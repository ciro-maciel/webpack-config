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

const baseConfig = {
  // https://webpack.js.org/configuration/devtool/
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "../www", "assets/js/"),
    filename: "[contenthash:12].js",
    chunkFilename: "[chunkhash:12].js",
  },
  performance: { hints: false },
  optimization: {
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
                  ["optipng", { optimizationLevel: 5 }],
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
      components: path.resolve(__dirname, "../src/components/index.js"),
      containers: path.resolve(__dirname, "../src/containers/index.js"),
      providers: path.resolve(__dirname, "../src/providers/index.js"),
      hooks: path.resolve(__dirname, "../src/hooks/index.js"),
      utils: path.resolve(__dirname, "../src/utils/index.js"),
    },
  },
};

const prodConfig = {
  mode: "production",
  output: {
    publicPath: "assets/js/",
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
      cleanOnceBeforeBuildPatterns: [
        path.join(__dirname, "../www/assets/**/*"),
      ],
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
      path: path.join(__dirname, `/.env.prod`),
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
};

const devConfig = {
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
      path: path.join(__dirname, `/.env.dev`),
      safe: true,
      systemvars: true,
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, "../../../www/"),
    index: "index.html",
    compress: true,
    open: true,
    port: 9090,
    hot: true,
    historyApiFallback: true,
  },
};

module.exports = (options = {}) => (env) =>
  merge(baseConfig, env.dev ? devConfig : prodConfig, options);
