const {createCommon} = require('./webpack.common.config')
const {merge} = require('webpack-merge')
const paths = require('./paths');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const common = createCommon()

const prodConfig = {
    mode: 'production',
    bail: true,
    devtool: false,
    output: {
        path: paths.appBuild,
        pathinfo: false,
        filename:'static/js/[name].[contenthash:8].js',
        chunkFilename:'static/js/[name].[contenthash:8].chunk.js',
        devtoolModuleFilenameTemplate:info =>
        path
          .relative(paths.appSrc, info.absoluteResourcePath)
          .replace(/\\/g, '/')
    },
    plugins:[
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
        new MiniCssExtractPlugin({
              filename: 'static/css/[name].[contenthash:8].css',
              chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            })
    ]
}
module.exports = merge(common,prodConfig)