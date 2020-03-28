module.exports = {
  plugins: [
    require('rollup-plugin-commonjs')(),
    require('rollup-plugin-node-resolve')(),
    require('rollup-plugin-node-globals')(),
    require('rollup-plugin-json')(),
    require('rollup-plugin-terser').terser({
      output: {
        comments(node, comment) {
          return /^!|@preserve|@license|@cc_on/i.test(comment.value);
        },
      },
    }),
  ],
};
