import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  // Single build for Google Apps Script
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'GASBundle',
    banner: '// Google Apps Script Bundle\n',
    footer: `
// Expose functions globally for Google Apps Script
function parseAvailabilities(html) {
  return GASBundle.parseAvailabilities(html);
}

function setupHeader(sheet) {
  return GASBundle.setupHeader(sheet);
}

function logAvailability() {
  return GASBundle.logAvailability();
}
`
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        declaration: false,
      }
    }),
  ]
};
