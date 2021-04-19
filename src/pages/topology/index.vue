<template>
  <div id="app">
    <div class="ocard">
      <div class="ocard-header">
        <div class="ocard-title">资源拓扑</div>
        <div class="ocard-button-groups">
          <el-button type="primary" size="mini" @click="changeZoomRatio(true)"
            >放大</el-button
          >
          <el-button type="primary" size="mini" @click="changeZoomRatio(false)"
            >缩小</el-button
          >
          <el-button type="primary" size="mini" @click="saveTopology"
            >保存</el-button
          >
          <el-button type="primary" size="mini" @click="resetTopology"
            >重置</el-button
          >
        </div>
      </div>
      <div class="topology-chart-containe">
        <svg
          id="topology-svg-box"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g class="topology-main-areare-box">
            <g class="topology-container-box">
              <!-- 元素 -->
              <g
                class="node-contain-element"
                v-for="item in nodes"
                :key="item.id"
                :data-id="item.id"
              >
                <rect
                  class="node-element"
                  width="120"
                  height="25"
                  rx="5"
                  ry="5"
                ></rect>
                <foreignObject class="text-element" width="100" height="20">
                  <el-tooltip effect="dark" :content="item.neName" placement="top">
                    <div class="ellipsis">{{item.neName}}</div>
                  </el-tooltip>
                </foreignObject>
              </g>
              <!-- 连线 -->
              <line
                v-for="(item, index) in edges"
                :key="item.target + index"
                class="line-element"
                stroke="#999"
                stroke-opacity="0.6"
                stroke-width="1"
                :data-source="item.source.id ? item.source.id : item.source"
                :data-target="item.target.id ? item.target.id : item.target"
              ></line>
            </g>
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
      simulation: null,
      zoomRatio: 100,
    };
  },
  created() {
    // localStorage.clear();
    const { nodes, edges } = originData.data;
    const cacheNodes = localStorage.getItem('cacheNodes');

    if (cacheNodes) this.nodes = JSON.parse(cacheNodes);
    else this.nodes = nodes;

    this.edges = edges;
  },
  mounted() {
    this.drawTopology();
    this.bindEvent();
  },
  methods: {
    drawTopology(minAlpha = 0.00001) {
      const svgContent = d3.select('.topology-container-box');
      this.simulation = d3
        .forceSimulation(this.nodes)
        .force(
          'link',
          d3.forceLink(this.edges).id((d) => d.id),
        )
        .force('charge', d3.forceManyBody().strength(-1000))
        .force('x', d3.forceX())
        .force('y', d3.forceY())
        .force('center', d3.forceCenter(width / 2, height / 2))
        .alphaMin(minAlpha)
        .on('tick', this.ticked);

      this.lineElement = svgContent.selectAll('.line-element').data(this.edges);

      this.nodeElement = d3.selectAll('.node-element').data(this.nodes);
      this.textElement = d3.selectAll('.text-element').data(this.nodes);
    },
    bindEvent() {
      this.simulation.on('tick', this.ticked).on('end', () => {
        console.log('it is end');
      });

      d3.select('svg')
        .attr('width', width)
        .attr('height', height)
        .call(d3.zoom().scaleExtent([1, 1]).on('zoom', this.zoomed));

      d3.selectAll('.node-contain-element')
        .data(this.nodes)
        .call(
          d3
            .drag()
            .on('start', (event, d) => {
              this.simulation.alphaTarget(0).restart();
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
            .on('end', (d) => {
              this.simulation.alphaTarget(0.0001).restart();
              // eslint-disable-next-line no-param-reassign
              d.fx = null;
              // eslint-disable-next-line no-param-reassign
              d.fy = null;
            }),
        );
    },
    ticked() {
      this.lineElement
        .attr('x1', (d) => d.source.x + 45)
        .attr('y1', (d) => d.source.y + 10)
        .attr('x2', (d) => d.target.x + 45)
        .attr('y2', (d) => d.target.y + 10);

      this.nodeElement.attr('x', (d) => d.x).attr('y', (d) => d.y);

      this.textElement.attr('x', (d) => d.x + 10).attr('y', (d) => d.y + 3);
    },
    changeZoomRatio(isAmplification) {
      let moveSize = 0;

      if (isAmplification && this.zoomRatio >= 500) {
        return this.$message.warning('缩放比例不合理无法正常显示');
      }
      if (!isAmplification && this.zoomRatio <= 30) {
        return this.$message.warning('缩放比例不合理无法正常显示');
      }
      if (isAmplification) {
        this.zoomRatio += 10;
        moveSize = (this.zoomRatio - 100) / -200;
      } else {
        this.zoomRatio -= 10;
        moveSize = (100 - this.zoomRatio) / 200;
      }

      d3.select('.topology-container-box')
        .transition()
        .duration(200)
        .attr(
          'transform',
          `translate(${width * moveSize}, ${height * moveSize}) scale(${
            this.zoomRatio / 100
          })`,
        );

      return true;
    },
    saveTopology() {
      this.$message.success('保存成功');
      const cacheNodes = this.nodes.map((v) => ({ ...v, fx: v.x, fy: v.y }));
      localStorage.setItem('cacheNodes', JSON.stringify(cacheNodes));
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
        'transform',
        `translate(${x} ${y}) scale(${k})`,
      );
    },
  },
};
</script>
<style>
* {
  margin: 0px;
  padding: 0px;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
body,
html {
  width: 100%;
  height: 100%;
  font-family: Arial, PingFang SC, Microsoft Yahei, "sans-serif";
  font-size: 12px;
  font-weight: 400;
  text-decoration: none;
}

body {
  background: #f1f4f6;
  padding: 20px 25px 10px;
}
#app {
  width: 100%;
  height: 100%;
}
.ocard {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 4px;
  padding: 12px 16px;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}
.ocard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ocard-title {
  font-size: 16px;
  color: #3c3e4a;
  position: relative;
  margin-bottom: 10px;
}
.ocard-title:before {
  content: "";
  position: absolute;
  width: 2px;
  height: 14px;
  left: -6px;
  top: 4px;
  background: #2c9cfa;
}
.ocard-button-groups {
  display: flex;
}

.topology-chart-containe {
  width: 100%;
  height: calc(100% - 50px);
  background: #f2f6f8;
  border-radius: 4px;
  border: 2px solid #d7dee4;
  overflow-y: scroll;
  margin-top: 20px;
}

#topology-svg-box {
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.node-element {
  fill: rgba(78, 171, 245, 0.6);
  stroke: #4eabf5;
}
.node-contain.unactive,
.line-element.unactive {
  opacity: 0.2;
}
.text-element{
  color: #000;
  font-size: 12px;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
