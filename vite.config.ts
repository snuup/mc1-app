import { jmxplugin } from "./vite-plugin-jmx" // "./jmx/ plugin/plugin/vite-plugin-jmx"

export default {
    base: "./",
    esbuild: {
        ignoreAnnotations: true,
        target: 'esnext',
    },
    plugins: [
        jmxplugin()
    ],
    build: {
        outDir: 'docs',
        target: 'esnext', // !!
        minify: false,
        rollupOptions: {
            outDir: '../docs/',
            output: {
                entryFileNames: `app.js`,
                assetFileNames: `[name].[ext]`
            }
        }
    },
    // optimizeDeps: {
    //     exclude: ['colors.css'],
    // },
    // server: {
    //     watch: {
    //         ignored: ['**/*.*'],
    //     },
    // },
}
