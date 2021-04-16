<template>
  <div id="app">
    <div class="ocard">
    <div class="ocard-header">
        <div class="ocard-title">资源拓扑</div>
        <div class="ocard-button-groups">
            <el-button type="primary" size="mini" @click="changeZoomRatio(true)">放大</el-button>
            <el-button type="primary" size="mini" @click="changeZoomRatio(false)">缩小</el-button>
            <el-button type="primary" size="mini" @click="resetTopology">重置</el-button>
        </div>
    </div>
    <div class="topology-legend">
      <div>环组：</div>
      <div
        class="topology-legend-item"
        v-for="(item,key) in loop"
        :key="key"
        :class="activeGroup.includes(key) ? 'active' : 'unactive'"
        @click="filterNodeGroup(key)"
      ></div>
    </div>
    <div class="topology-chart-containe">
        <svg id="topology-svg-box" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g class="topology-main-areare-box">
                <g class="topology-container-box"></g>
            </g>
        </svg>
    </div>
</div>
  </div>
</template>
<script>
import * as d3 from 'd3';
import originData from './config/mook';

const width = window.innerWidth;
const height = window.innerHeight;
export default {
  name: 'topology',
  data() {
    return {
      nodes: [],
      links: [],
      loop: [],
      activeGroup: [],
      simulation: null,
      zoomRatio: 100,
    };
  },
  created() {
    const { nodes, edges, loop } = originData.data;
    const loopList = {};
    this.nodes = nodes.map((v) => ({ ...v, label: `${v.neName.slice(0, 8)}...` }));
    this.edges = edges;

    loop.forEach((v) => {
      loopList[v.name] = v.neName;
    });
    this.loop = loopList;
    this.activeGroup = Object.keys(loop);

    this.simulation = d3
      .forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.edges).id((d) => d.id));
  },
  mounted() {
    this.drawTopology();
    this.bindEvent();
  },
  methods: {
    drawTopology(minAlpha = 0.00001) {
      const svgContent = d3.select('.topology-container-box');
      this.simulation
        .force('charge', d3.forceManyBody().strength(-1000))
        .force('x', d3.forceX())
        .force('y', d3.forceY())
        .force('center', d3.forceCenter(width / 2, height / 2))
        .alphaMin(minAlpha);

      const nodeContent = svgContent
        .selectAll('g')
        .data(this.nodes)
        .join('g')
        .attr('class', 'node-contain')
        .attr('data-id', (d) => JSON.stringify(d.id))
        .on('click', (event, d) => {
          this.filterNodeRelation(this.loop[d.loop]);
        })
        .call(d3.drag()
          .on('start', (event, d) => {
            if (!event.active) this.simulation.alphaTarget(0.0001).restart();
            // eslint-disable-next-line no-param-reassign
            d.fx = d.x;
            // eslint-disable-next-line no-param-reassign
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            // eslint-disable-next-line no-param-reassign
            d.fx = event.x;
            // eslint-disable-next-line no-param-reassign
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) this.simulation.alphaTarget(0);
            // eslint-disable-next-line no-param-reassign
            d.fx = null;
            // eslint-disable-next-line no-param-reassign
            d.fy = null;
          }));

      this.lineElement = svgContent.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(this.edges)
        .join('line')
        .attr('class', 'line-element')
        .attr('data-source', (d) => d.source.id)
        .attr('data-target', (d) => d.target.id)
        .attr('stroke-width', 1);

      this.nodeElement = nodeContent
        .append('rect')
        .attr('width', 90)
        .attr('height', 25)
        .attr('class', 'topology-node')
        .attr('rx', 5)
        .attr('ry', 5);

      this.textElement = nodeContent.append('text')
        .attr('fill', '#000')
        .text((d) => d.label);
    },
    bindEvent() {
      this.simulation
        .on('tick', this.ticked)
        .on('end', () => {
          console.log('it is end');
        });

      d3.select('svg')
        .attr('width', width)
        .attr('height', height)
        .call(
          d3.zoom().scaleExtent([1, 1]).on('zoom', this.zoomed),
        );
    },
    ticked() {
      this.lineElement.attr('x1', (d) => d.source.x + 45)
        .attr('y1', (d) => d.source.y + 10)
        .attr('x2', (d) => d.target.x + 45)
        .attr('y2', (d) => d.target.y + 10);

      this.nodeElement.attr('x', (d) => d.x)
        .attr('y', (d) => d.y);

      this.textElement.attr('x', (d) => d.x + 10)
        .attr('y', (d) => d.y + 16);
    },
    filterNodeRelation(result) {
      const arrRes = JSON.stringify(result); // 优化
      d3.selectAll('.node-contain').attr('class', function () {
        const id = d3.select(this).attr('data-id');
        return arrRes.includes(id) ? 'node-contain active' : 'node-contain unactive';
      });

      d3.selectAll('.line-element').attr('class', function () {
        const $this = d3.select(this);
        const source = $this.attr('data-source');
        const target = $this.attr('data-target');
        return arrRes.includes(source) && arrRes.includes(target)
          ? 'line-element active'
          : 'line-element unactive';
      });
    },
    changeZoomRatio(isAmplification) {
      let moveSize = 0;

      if (isAmplification && this.zoomRatio >= 500) return alert('缩放比例不合理无法正常显示');
      if (!isAmplification && this.zoomRatio <= 30) return alert('缩放比例不合理无法正常显示');
      if (isAmplification) {
        this.zoomRatio += 10;
        moveSize = (this.zoomRatio - 100) / -200;
      } else {
        this.zoomRatio -= 10;
        moveSize = (100 - this.zoomRatio) / 200;
      }

      d3.select('.topology-container-box').transition().duration(200).attr(
        'transform',
        `translate(${width * moveSize}, ${height
                * moveSize}) scale(${this.zoomRatio / 100})`,
      );

      return true;
    },
    filterNodeGroup(name) {
      if (this.activeGroup.includes(name)) {
        this.activeGroup = this.activeGroup.filter((v) => v !== name);
      } else this.activeGroup.push(name);

      let result = [];
      this.activeGroup.forEach((v) => {
        result = result.concat(this.loop[v]);
      });
      this.filterNodeRelation(result);
    },
    resetTopology() {
      this.simulation
        .force('charge', d3.forceManyBody().strength(-1000))
        .alpha(1)
        .restart();
    },
    zoomed(event) {
      const { x, y, k } = event.transform;
      d3.select('.topology-main-areare-box').attr(
        'transform', `translate(${x} ${y}) scale(${k})`,
      );
    },
  },
};
</script>
<style>
*{
    margin: 0px;
    padding: 0px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
}
body,html{
    width: 100%;
    height: 100%;
    font-family: Arial,PingFang SC,Microsoft Yahei,"sans-serif";
    font-size: 12px;
    font-weight: 400;
    text-decoration: none;
}

body{
    background: #f1f4f6;
    padding: 20px 25px 10px;
}
#app{
  width: 100%;
  height: 100%;
}
.ocard{
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: 4px;
    padding: 12px 16px;
    -webkit-border-radius:4px;
    -moz-border-radius:4px;
    border-radius: 4px;
}
.ocard-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.ocard-title{
    font-size: 16px;
    color: #3c3e4a;
    position: relative;
    margin-bottom: 10px;
}
.ocard-title:before{
    content: "";
    position: absolute;
    width: 2px;
    height: 14px;
    left: -6px;
    top: 4px;
    background: #2c9cfa;
}
.ocard-button-groups{
    display: flex;
}

.topology-chart-containe{
    width: 100%;
    height: calc(100% - 50px);
    background: #f2f6f8;
    border-radius: 4px;
    border: 2px solid #d7dee4;
    overflow-y: scroll;
    margin-top:20px;
}

#topology-svg-box{
    width: 100%;
    height: 100%;
    cursor: pointer;
}
.topology-node{
    fill: rgba(78,171,245,.6);
    stroke: #4EABF5;
}
.node-contain.unactive,.line-element.unactive{
  opacity: 0.2;
}
.topology-legend{
  display: flex;
  justify-content: flex-end;
  color: #455A74;
    font-size: 14px;
  margin-top: 20px;
}
.topology-legend-item{
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #6DC3FC;
  margin-left: 30px;
  cursor: pointer;
}
.topology-legend-item.unactive{
  opacity: 0.2;
}
.topology-legend-item:nth-child(2){
  margin-left: 10px;
}
.topology-legend-item:nth-child(3){
  background: #FDB970;
}
.topology-legend-item:nth-child(4){
  background: #F68383;
}
.topology-legend-item:nth-child(5){
  background: #FD9D7B;
}
.topology-legend-item:nth-child(6){
  background: #50D7AA;
}
.topology-legend-item:nth-child(7){
  background: #2FC272;
}
.topology-legend-item:nth-child(8){
  background: #8C8CDC;
}
.topology-legend-item:nth-child(9){
  background: #223273;
}
</style>
