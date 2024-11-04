import path from 'path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
    server: {
        fs: {
            // Allow serving files from one level up to the project root 
            allow: [
                path.resolve(__dirname, "../..")
            ]
        }
    },
    resolve: {
        alias: {
            "@hpcc-js": path.resolve(__dirname, "../../packages")
        }
    },
    plugins: [react()],
})
