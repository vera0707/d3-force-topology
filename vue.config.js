module.exports = {
  productionSourceMap: false,
  publicPath: './',
  pages: {
    index: {
      entry: 'src/pages/topology/index.js',
      title: 'D3 - 力图拓扑',
      filename: 'index.html',
    },
  },
  devServer: {
    open: true,
    port: 9000,
  },
};
