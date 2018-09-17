 var path = require('path');
 var webpack = require('webpack');

 var ENV = process.env.npm_lifecycle_event;

 var isTest = ENV === 'test' || ENV === 'test-watch';
 var isProd = ENV === 'build';

 module.exports = {
     entry:  './src/index.js',
     output: {
         path: path.resolve(__dirname, '.'),
         filename: './bin/app.js'
     },
     module: {
         loaders: [
             {
                 test: /\.js$/,
                 loader: 'babel-loader',
                 query: {
                     presets: ['es2015']
                 }
             }
         ]
     },
     stats: {
         colors: true
     },
     devtool: isProd?null:'source-map'
 };
