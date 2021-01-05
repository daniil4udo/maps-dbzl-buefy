module.exports = {
    configureWebpack: (config) => {
        config.module.rules = [
            {
                test: /\.worker\.ts$/i,
                use: [
                    {
                        loader: 'comlink-loader',
                        options: {
                            singleton: true
                        }
                    }
                ]
            },
            ...config.module.rules
        ]

    },
    
    chainWebpack(config) {
        // ===
        // SVG Loader
        // ===
        config.module
            .rule('vue')
            .use('vue-svg-inline-loader')
            .loader(require.resolve('vue-svg-inline-loader'))
            .options({
                addTitle: true,
                svgo: true,
            });
    }
}