# oss-topology

#### 基于D3力图的复杂拓扑图

> 在对比了D3/G6/jTopo/dagre-d3/JointJS,最终还是选择了D3的力图

> dagre图能极清晰的展现关联关系，这方面G6简单上手、算法更优秀，但是大数据时紧凑度远远不够

> 既想要展现强关联关系，又要结构紧凑，最后还是优秀的D3力图更胜一筹

> 国内Ant团队研发的G6也是一个很棒的库,上手简单好用，但是可惜底层算法远不如D3

> 同样的数据，G6呈现的效果就像效果就像一团麻，但是D3可以极大程度的关系“成环”

> D3像是乐高积木，只要你认真学习一定会很惊艳，就是学习成本有点高

> D3不同的版本区别还是蛮大的，网上的资料只能给点灵感，还是要看官网官网官网

#### 几个有用的地址
[D3官方](https://d3js.org/)

[D3-force开发文档](https://devdocs.io/d3~6/d3-force#center_strength)

[G6-antv团队研发官方地址](https://antv.vision/zh/)

[dagre-d3无向环图优秀的实践方案](https://github.com/dagrejs/dagre-d3)

[jtopo-优秀拓扑图但是依赖jQuery](http://www.jtopo.com/)

[jointjs-交互式拓扑优秀的实践方案](https://resources.jointjs.com/)

#### 该项目实现的功能

- [x] 画布拖拽
- [x] 画布缩放
- [x] 结点拖拽
- [x] 画布重置
- [x] 结点关联组效果
- [x] 成环组筛选
- [ ] 操作记录保存