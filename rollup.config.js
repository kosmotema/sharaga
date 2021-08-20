import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  input: 'src/app.ts',
  output: {
    file: 'bin/server.js',
    format: 'cjs',
  },
  plugins: [
    typescript()
  ]
});