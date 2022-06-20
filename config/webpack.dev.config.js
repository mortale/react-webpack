const {env,createCommon} = require('./webpack.common.config')
const { merge } = require('webpack-merge')
const path = require('path');
const paths = require('./paths');
const webpackDevClientEntry = require.resolve('react-dev-utils/webpackHotDevClient');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const webpack = require('webpack');
const common = createCommon(true)

const devConfig = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry:[webpackDevClientEntry,paths.appIndexJs],
    output: {
        path:undefined,
        filename: 'static/js/[name].bundle.js',
        chunkFilename: 'static/js/[name].chunk.js',
        devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'), 
        clean:true
    },
    plugins:[
        new webpack.HotModuleReplacementPlugin(),
        new CaseSensitivePathsPlugin()
    ]
}

module.exports = merge(common, devConfig)