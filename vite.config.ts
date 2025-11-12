import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from "vite-plugin-vuetify";
import autoprefixer from "autoprefixer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
  base: "",
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 3000,
  },
  build: {
    // Optimize CSS for replay functionality
    cssCodeSplit: false, // Force all CSS into one file
    minify: false, // Disable minification to keep CSS readable for editing
    rollupOptions: {
      output: {
        // CSS file naming options - choose one:
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            // Option 1: Fixed name (best for replay servers)
            return 'assets/app-styles.css';
            
            // Option 2: Version-based naming
            // return 'assets/styles.v1.0.0.css';
            
            // Option 3: Date-based naming
            // return `assets/styles.${new Date().toISOString().slice(0,10)}.css`;
            
            // Option 4: Custom hash format
            // return 'assets/app.[hash:8].css';
            
            // Option 5: Environment-based naming
            // return `assets/styles.${process.env.NODE_ENV || 'prod'}.css`;
          }
          return 'assets/[name].[hash].[ext]';
        },
      },
    },
  },
});
