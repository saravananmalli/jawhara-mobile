// Strips `import.meta` (used by zustand's unused `devtools` middleware for
// Vite compatibility) so it doesn't throw a SyntaxError when Metro serves the
// web bundle as a classic <script> tag, which doesn't support import.meta.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      function stripImportMeta() {
        return {
          visitor: {
            MetaProperty(path) {
              path.replaceWithSourceString('({ env: {} })');
            },
          },
        };
      },
    ],
  };
};
