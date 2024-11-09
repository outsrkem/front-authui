const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    configureWebpack: {
        devtool: false,
    },
    transpileDependencies: true,
    publicPath: '/authui/',
    pages: {
        login: 'src/pages/login/main.js',
        forgetpwd: 'src/pages/forgetpwd/main.js',
    },
    devServer: {
        proxy: {
          '/': {
            target: 'https://uias.localvm.outsrkem.top:30078',
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
