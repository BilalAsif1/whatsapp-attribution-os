const esbuild = require('esbuild');
const path = require('path');

esbuild.build({
  entryPoints: [path.join(__dirname, '../api/index.js')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: path.join(__dirname, '../api-bundle/index.js'),
  format: 'cjs',
  external: [],
  minify: false,
  sourcemap: false,
  metafile: true,
}).then(result => {
  const size = Object.values(result.metafile.outputs)[0].bytes;
  console.log(`Bundle size: ${(size / 1024 / 1024).toFixed(2)} MB`);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
