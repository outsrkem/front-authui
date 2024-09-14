const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    configureWebpack: {
        devtool: false,
    },
    transpileDependencies: true,
    publicPath: '/authui/',
    pages: {
        login: 'src/main.js',
    },
    devServer: {
        proxy: {
          '/': {
            target: 'http://10.10.10.14:8080',
            changeOrigin: true,
            secure: false,
            pathRewrite: {
              '^/uias': '/uias'
            }
          }
        },
        webSocketServer: false,
    },
})
