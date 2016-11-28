"use strict";
var path = require('path');
var webpack = require('webpack');
var EncodingPlugin = require('webpack-encoding-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var extractCSS = new ExtractTextPlugin('client.min.css');
var extractHTML = new ExtractTextPlugin('index.html');

var config = {
    entry: ['./public/blubb.js','./public/blubb.css','./public/blubb.html'],
    output: {
        path: './public',
        filename: 'client.min.js'
    },
    watch: true,
    stats: {
        // Configure the console output
        colors: true,
        modules: true,
        reasons: true
    },
    module: {
        preLoaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'jshint-loader'
          }
       ],
        loaders: [
          {
            test: /\.css$/,
            loader: extractCSS.extract("style-loader", "css-loader")
          },
          {
            test: /\.html$/,
             loader: extractHTML.extract('raw-loader!html-minifier-loader')
          }
        ]
    },
    plugins: [
        extractCSS,
        extractHTML,
        new webpack.NoErrorsPlugin(),
        new EncodingPlugin('utf8'),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: true
            },
            output: {
                comments: false
            }
        })
    ]
};

module.exports = config;
