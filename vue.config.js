module.exports = {
  productionSourceMap: false,
  publicPath: './',
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
