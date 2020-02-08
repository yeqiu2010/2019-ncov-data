<template>
  <div>
    <div style="border-bottom: 1px solid silver;margin: 0 5px;height: 200px">
      <p style="text-align: left">截至 {{statisticUpdateTime}} 全国数据统计</p>
      <el-row type="flex" justify="center">
        <template v-for="item in changeStatisticDatas">
          <el-col :span="6">
            <data-change-item :data=item></data-change-item>
          </el-col>
        </template>
      </el-row>
    </div>
    <div id="china_map" style='height:400px;'></div>
  </div>
</template>

<script>
  import echarts from "echarts";
  import 'echarts/map/js/china';
  import {mapState, mapActions, mapMutations} from 'vuex';
  import DataChangeItem from "../../components/DataChangeItem";

  export default {
    name: "home",
    components: {DataChangeItem},
    data() {
      return {
        chinaChart: null,
        chartOption: null,
        changeStatisticDatas: [],
        statisticUpdateTime: ''
      };
    },
    mounted() {
      this.chinaChart = echarts.init(document.getElementById('china_map'));
      // 进行相关配置
      this.chartOption = {
        tooltip: { // 鼠标移到图里面的浮动提示框
          // formatter详细配置： https://echarts.baidu.com/option.html#tooltip.formatter
          formatter(params, ticket, callback) {
            // params.data 就是series配置项中的data数据遍历
            let provinceName, confirmedCount, curedCount, deadCount;
            if (params.data) {
              provinceName = params.data.provinceName;
              confirmedCount = params.data.confirmedCount;
              curedCount = params.data.curedCount;
              deadCount = params.data.deadCount;
            } else { // 为了防止没有定义数据的时候报错写的
              provinceName = '';
              confirmedCount = 0;
              curedCount = 0;
              deadCount = 0;
            }
            let htmlStr = `
          <p style='text-align:left;'>
	          <span>省份：${provinceName}</span><br/>
	          <span style="color: lightgray">确诊：${confirmedCount}</span><br/>
	          <span style="color: lightgreen">治愈：${curedCount}</span><br/>
	          <span style="color: red">死亡：${deadCount}</span><br/>
          </p>
        `;
            return htmlStr;
          }
          // backgroundColor:"#ff7f50",//提示标签背景颜色
          // textStyle:{color:"#fff"} //提示标签字体颜色
        },
        // visualMap的详细配置解析：https://echarts.baidu.com/option.html#visualMap
        visualMap: { // 左下角的颜色区域
          type: 'piecewise', // 定义为分段型 visualMap
          min: 0,
          max: 1000,
          itemWidth: 40,
          bottom: 60,
          left: 20,
          pieces: [ // 自定义『分段式视觉映射组件（visualMapPiecewise）』的每一段的范围，以及每一段的文字，以及每一段的特别的样式
            {gt: 10000, label: '>10000', color: '#4f070d'},
            {gt: 1000, lte: 10000, label: '1000-10000', color: '#811c24'},
            {gt: 500, lte: 999, label: '500-999', color: '#cb2a2f'},
            {gt: 100, lte: 499, label: '100-499', color: '#e55a4e'},
            {gt: 10, lte: 99, label: '10-99', color: '#f59e83'},
            {gt: 0, lte: 9, label: '0-9', color: '#fdebcf'}
          ]
        },
        // geo配置详解： https://echarts.baidu.com/option.html#geo
        geo: { // 地理坐标系组件用于地图的绘制
          map: 'china', // 表示中国地图
          roam: true, // 是否开启鼠标缩放和平移漫游
          zoom: 1.2, // 当前视角的缩放比例（地图的放大比例）
          label: {
            show: true
          },
          itemStyle: { // 地图区域的多边形 图形样式。
            borderColor: 'rgba(0, 0, 0, 0.2)',
            emphasis: { // 高亮状态下的多边形和标签样式
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        },
        series: [
          {
            name: '', // 浮动框的标题（上面的formatter自定义了提示框数据，所以这里可不写）
            type: 'map',
            geoIndex: 0,
            label: {
              show: true
            },
            // 这是需要配置地图上的某个地区的数据，根据后台的返回的数据进行拼接（下面是我定义的假数据）
            data: []
          }
        ]
      };

      // 使用刚指定的配置项和数据显示地图数据
      this.chinaChart.setOption(this.chartOption);

      this.addDxyData();
    },
    computed: {
      ...mapState(['dxyStatisticData', 'dxyAreaData'])
    },
    methods: {
      ...mapActions(['getNcovDataFromDXY']),

      // 加载丁香园的各省数据
      async addDxyData() {
        let resp = await this.getNcovDataFromDXY();
        if (resp === 1) {
          // 渲染疫情地图数据
          this.chinaChart.setOption({
            series: [
              {
                name: '',
                type: 'map',
                geoIndex: 0,
                label: {
                  show: true
                },
                data: this.dxyAreaData
              }
            ]
          });
          // 加载统计数据
          this.changeStatisticDatas.push({
            name: '确诊',
            changeCount: this.dxyStatisticData.confirmedIncr,
            total: this.dxyStatisticData.confirmedCount,
            color: '#f74c31'
          });
          this.changeStatisticDatas.push({
            name: '疑似',
            changeCount: this.dxyStatisticData.suspectedIncr,
            total: this.dxyStatisticData.suspectedCount,
            color: '#f78207'
          });
          this.changeStatisticDatas.push({
            name: '重症',
            changeCount: this.dxyStatisticData.seriousIncr,
            total: this.dxyStatisticData.seriousCount,
            color: '#a25a4e'
          });
          this.changeStatisticDatas.push({
            name: '死亡',
            changeCount: this.dxyStatisticData.deadIncr,
            total: this.dxyStatisticData.deadCount,
            color: '#5d7092'
          });
          this.changeStatisticDatas.push({
            name: '治愈',
            changeCount: this.dxyStatisticData.curedIncr,
            total: this.dxyStatisticData.curedCount,
            color: '#28b7a3'
          });
          let unixTimestamp = new Date(this.dxyStatisticData.modifyTime);
          this.statisticUpdateTime = unixTimestamp.toLocaleString();
        }
      }
    }
  };
</script>

<style scoped>

</style>
