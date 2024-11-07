import path from 'path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "@hpcc-js": path.resolve(__dirname, "./packages")
        }
    },
    plugins: [react()],
})
