module.exports = {
  outputDir: 'topology',
  productionSourceMap: false,
  pages: {
    index: {
      entry: 'src/pages/topology/index.js',
      title: 'OSS Topology',
      filename: 'index.html',
    },
  },
  devServer: {
    open: true,
    port: 9000,
  },
};
