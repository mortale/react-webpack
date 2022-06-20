'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const resolve = require('resolve');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const ESLintPlugin = require('eslint-webpack-plugin');
const paths = require('./paths');
const modules = require('./modules');
const getClientEnvironment = require('./env');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
// const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const theme = require('../package.json').theme;

const appPackageJson = require(paths.appPackageJson);

// const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

const reactRefreshOverlayEntry = require.resolve(
  'react-dev-utils/refreshOverlayInterop'
);


const emitErrorsAsWarnings = process.env.ESLINT_NO_DEV_ERRORS === 'true';
// const disableESLintPlugin = process.env.DISABLE_ESLINT_PLUGIN === 'true';

const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);


const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false;
  }

  try {
    require.resolve('react/jsx-runtime');
    return true;
  } catch (e) {
    return false;
  }
})();

const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));
const shouldUseReactRefresh = env.raw.FAST_REFRESH;

const getStyleLoaders = (isEnvDevelopment, cssOptions, preProcessor) => {
  const loaders = [
    require.resolve('style-loader'),
    !isEnvDevelopment && {
      loader: MiniCssExtractPlugin.loader,
      options: paths.publicUrlOrPath.startsWith('.')
        ? { publicPath: '../../' }
        : {},
    },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
  ].filter(Boolean)
  if (preProcessor) {
    loaders.push(
      {
        loader: require.resolve('resolve-url-loader'),
        options: {
          root: paths.appSrc,
        },
      },
      {
        loader: require.resolve(preProcessor),
        options: {
          lessOptions: {
            modifyVars: theme,
            javascriptEnabled: true
          },
        }
      }
    );
  }
  return loaders;
};



const plugins = (isEnvDevelopment) => [
  new HtmlWebpackPlugin(
    Object.assign(
      {},
      {
        inject: true,
        template: paths.appHtml,
      }
    )
  ),
  new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
  new ModuleNotFoundPlugin(paths.appPath),
  new webpack.DefinePlugin(env.stringified),

  shouldUseReactRefresh &&
  new ReactRefreshWebpackPlugin({
    overlay: false
    // {
    //   entry: webpackDevClientEntry,
    //   module: reactRefreshOverlayEntry,
    //   sockIntegration: false,
    // },
  }),

  new WebpackManifestPlugin({
    fileName: 'asset-manifest.json',
    publicPath: paths.publicUrlOrPath,
    generate: (seed, files, entrypoints) => {
      const manifestFiles = files.reduce((manifest, file) => {
        manifest[file.name] = file.path;
        return manifest;
      }, seed);
      const entrypointFiles = entrypoints.main.filter(
        fileName => !fileName.endsWith('.map')
      );

      return {
        files: manifestFiles,
        entrypoints: entrypointFiles,
      };
    },
  }),

  new webpack.IgnorePlugin({ resourceRegExp: /^(\.\/locale | moment)$/ }),

  // new ForkTsCheckerWebpackPlugin({
  //   typescript: resolve.sync('typescript', {
  //     basedir: paths.appNodeModules,
  //   }),
  //   async: isEnvDevelopment,
  //   checkSyntacticErrors: true,
  //   tsconfig: paths.appTsConfig,
  //   reportFiles: [
  //     '../**/src/**/*.{ts,tsx}',
  //     '**/src/**/*.{ts,tsx}',
  //     '!**/src/**/__tests__/**',
  //     '!**/src/**/?(*.)(spec|test).*',
  //     '!**/src/setupProxy.*',
  //     '!**/src/setupTests.*',
  //   ],
  //   // silent: true,
  //   // formatter: typescriptFormatter,
  // }),

  new ESLintPlugin({
    extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
    formatter: require.resolve('react-dev-utils/eslintFormatter'),
    eslintPath: require.resolve('eslint'),
    failOnError: !(isEnvDevelopment && emitErrorsAsWarnings),
    context: paths.appSrc,
    cache: true,
    cacheLocation: path.resolve(
      paths.appNodeModules,
      '.cache/.eslintcache'
    ),
    cwd: paths.appPath,
    resolvePluginsRelativeTo: __dirname,
    baseConfig: {
      extends: [require.resolve('eslint-config-react-app/base')],
      rules: {
        ...(!hasJsxRuntime && {
          "react-hooks/exhaustive-deps": 'off',
          'react/react-in-jsx-scope': 'error',
        }),
      },
    },
  }),
]


const createCommon = function (isEnvDevelopment) {
  return {
    target: ['browserslist'],
    entry: paths.appIndexJs,
    output: {
      assetModuleFilename: 'static/media/[name].[hash][ext][query]',
      publicPath: paths.publicUrlOrPath,
      chunkLoadingGlobal: `webpackJsonp_${appPackageJson.name}`,
      globalObject: 'window',
    },

    resolve: {
      fallback: {
        fs: false,
        url: false
      },
      modules: ['node_modules', paths.appNodeModules].concat(
        modules.additionalModulePaths || []
      ),
      extensions: paths.moduleFileExtensions
        .map(ext => `.${ext}`),
      alias: {
        'react': path.resolve(__dirname, '../node_modules/react'),
        // ...(isEnvProductionProfile && {
        //   'react-dom$': 'react-dom/profiling',
        //   'scheduler/tracing': 'scheduler/tracing-profiling',
        // }),

      },
      plugins: [
        // new ModuleScopePlugin(paths.appSrc, [
        //   paths.appPackageJson,
        //   reactRefreshOverlayEntry,
        // ]),
      ],

    },
    resolveLoader: {
    },
    module: {
      strictExportPresence: true,
      rules: [
        // { parser: { requireEnsure: false } },
        {
          oneOf: [

            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              type: "asset/inline",
              generator: {
                filename: 'static/media/[name].[hash:8].[ext]',
              },
            },
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: paths.appSrc,
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve(
                  'babel-preset-react-app/webpack-overrides'
                ),
                presets: [
                  [
                    require.resolve('babel-preset-react-app'),
                    {
                      runtime: hasJsxRuntime ? 'automatic' : 'classic',
                    },
                  ],
                ],
                plugins: [
                  [
                    require.resolve('babel-plugin-named-asset-import'),
                    {
                      loaderMap: {
                        svg: {
                          ReactComponent:
                            '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                        },
                      },
                    },
                  ],
                  isEnvDevelopment &&
                  shouldUseReactRefresh &&
                  require.resolve('react-refresh/babel'),
                ].filter(Boolean),
                cacheDirectory: true,
                cacheCompression: false,
                compact: !isEnvDevelopment,
              },
            },
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('babel-preset-react-app/dependencies'),
                    { helpers: true },
                  ],
                ],
                cacheDirectory: true,
                cacheCompression: false,
              },
            },
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders(isEnvDevelopment, {
                importLoaders: 1
              }),
              sideEffects: true,
            },
            {
              test: cssModuleRegex,
              use: getStyleLoaders(isEnvDevelopment, {
                importLoaders: 1,
                modules: {
                  getLocalIdent: getCSSModuleLocalIdent,
                },
              }),
            },
            {
              test: lessRegex,
              exclude: lessModuleRegex,
              use: getStyleLoaders(isEnvDevelopment,
                {
                  importLoaders: 3
                },
                'less-loader'
              ),
              sideEffects: true,
            },
            {
              test: lessModuleRegex,
              use: getStyleLoaders(isEnvDevelopment,
                {
                  importLoaders: 3,
                  modules: {
                    getLocalIdent: getCSSModuleLocalIdent,
                  },
                },
                'less-loader'
              ),
            },
            {
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              type: "asset/resource",
              generator: {

                filename: 'static/media/[name].[hash:8].[ext]',
              },
            },
          ],
        },
      ],
    },
    plugins: plugins(isEnvDevelopment),
    node: {
      // module: 'empty',
      // dgram: 'empty',
      // dns: 'mock',
      // http2: 'empty',
      // net: 'empty',
      // tls: 'empty',
      // child_process: 'empty',
    },
    optimization: {
      minimize: !isEnvDevelopment,
      minimizer: [
        new TerserPlugin({
          extractComments:false,
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            // keep_classnames: isEnvProductionProfile,
            // keep_fnames: isEnvProductionProfile,
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
          // sourceMap: shouldUseSourceMap,
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        minChunks: 2,
        automaticNameDelimiter: '.',
        cacheGroups: {
          'formily-dll': {
            test: (module) => {
              return /@formily/.test(module.context);
            },
            chunks: "async",
            name: "formily-dll",
            priority: 100,
            reuseExistingChunk: true
          },
          'antd-dll': {
            test: (module) => {
              return /antd(.*)/.test(module.context);
            },
            chunks: "async",
            name: "antd-dll",
            priority: 130,
            reuseExistingChunk: true
          },
          "antDesign-dll": {
            chunks: 'all',
            test: /@ant-design/,
            name: 'antDesign-dll',
            enforce: true,
            priority: 200,
            reuseExistingChunk: true,
          },
          // 'react-dll': {
          //   test: (module) => {
          //     return /react-router-dom|redux|react-intl|prop-types|react-beautiful-dnd|react-dnd|dnd-core|react-(.*)/.test(module.context);
          //   },
          //   chunks: "all",
          //   name: "react-dll",
          //   priority: -10,
          //   enforce: true
          // },
          "rc-dll": {
            chunks: 'all',
            test: /rc-/,
            name: 'rc-dll',
            enforce: true,
            priority: 300,
            reuseExistingChunk: true,
          },
          'custom-formily-dll': {
            test: path.resolve(__dirname, "../src/components/formily"), // 可自定义拓展你的规则
            chunks: "async",
            name: "custom-formily-dll",
            reuseExistingChunk: true,
            priority: 80
          },
          "vendors-dll": {
            chunks: 'all',
            test: /[\\/]module[\\/](?!(antd|rc-|@formily|@ant-design))/,
            name: 'vendors-dll',
            enforce: true,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    },
    performance: false,
  };
}


module.exports = {
  env,
  createCommon
}