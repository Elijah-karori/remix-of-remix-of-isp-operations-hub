import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    server: {
      // Only apply these server settings in development mode
      ...(isProduction ? {} : {
        host: "0.0.0.0",
        port: 8080,
        hmr: {
          clientPort: 8080,
        },
        watch: {
          usePolling: true,
        },
      }),
    },
    plugins: [
      react(),
      mode === "development" && componentTagger()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist', // Default build output directory, can be customized
      sourcemap: isProduction, // Generate sourcemaps for production builds (can be 'hidden' for more security)
      minify: isProduction ? 'terser' : false, // Minify for production, disable in development
      cssCodeSplit: true, // Enable CSS code splitting
      rollupOptions: {
        output: {
          // Customize chunking for better caching and smaller initial load
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Create a 'vendor' chunk for all node_modules
              return 'vendor';
            }
          },
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`
        }
      }
    },
    // Define global constants replacements
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});
