const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: {
        "landingPageMain": "./landingPageSrc/index.js",
        "lobbyPageMain": "./lobbyPageSrc/index.js",
        "joinGamePage": "./joinGamePageSrc/index.js",
        "selectionPage": "./songSelectionPageSrc/index.js",
        "gamePage": "./gamePageSrc/index.js",
    },
    output: {
        path: path.resolve(__dirname, "./static/frontend"),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    optimization: {
        minimize: true,
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                // This has effect on the react lib size
                NODE_ENV: JSON.stringify("production"),
            },
        }),
    ],
};