const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
    configureWebpack: {
        devtool: false,
    },
    transpileDependencies: true,
    publicPath: "/authui/",
    pages: {
        login: "src/pages/login/main.js",
        forgetpwd: "src/pages/forgetpwd/main.js",
    },
    devServer: {
        proxy: {
            "/": {
                target: "https://turtle.outsrkem.top:35860",
                changeOrigin: true,
                secure: false,
                pathRewrite: {
                    "^/uias": "/uias",
                },
            },
        },
        webSocketServer: false,
    },
});
