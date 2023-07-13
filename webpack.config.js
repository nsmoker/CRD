const webpack = require('webpack');

module.exports = {
    entry: {
        ChessApp: './src/main.tsx'
    },

    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: [ "style-loader", "css-loader" ],
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                    {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                    },
                    },
                ],
            },
            {
                test: /\.(ts|tsx)?$/,
                use: 'ts-loader',
                exclude: '/node-modules/'
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.ts', '.tsx']
    },
    output: {
        path: `${__dirname}/fe-compiled`,
        publicPath: '/',
        filename: '[name].bundle.js'
    },
    mode: 'development'
}