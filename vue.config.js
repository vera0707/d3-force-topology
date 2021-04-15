module.exports = {
  outputDir: 'topology',
  pages: {
    index: {
      entry: 'src/pages/topology/index.js',
      template: 'public/index.html',
      title: 'OSS Topology',
      filename: 'index.html',
    },
  },
  devServer: {
    open: true,
    port: 9000,
  },
};
