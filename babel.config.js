module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'], // nếu không dùng Expo thì thay bằng 'module:metro-react-native-babel-preset'
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./src'],
                    alias: {
                        '@': './src',
                        '@components': './src/components',
                        '@services': './src/services',
                        '@utils': './src/utils',
                        '@assets': './src/assets',
                        '@screens': './src/screens',
                        '@styles': './src/styles',
                        '@navigation': './src/navigation',
                        '@store': './src/store',
                        '@providers': './src/providers',
                        '@types': './src/types',
                    },
                },
            ],
            'react-native-worklets/plugin', // ✅ chỉ cần để thẳng như thế này
            [
                'module:react-native-dotenv',
                {
                    moduleName: '@env',
                    path: '.env', // 👈 chỉ rõ file .env nằm ở root
                },
            ],
        ],
    };
};
