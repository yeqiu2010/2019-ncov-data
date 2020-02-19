<template>
  <div class="home-container">
    <div style="border-bottom: 1px solid silver;margin: 0 5px;">
      <p style="text-align: left">截至 {{statisticUpdateTime}} 全国数据统计</p>
      <el-row type="flex" justify="center">
        <template v-for="item in changeStatisticDatas">
          <el-col :span="6">
            <data-change-item :data=item></data-change-item>
          </el-col>
        </template>
      </el-row>
    </div>
    <!-- 中国疫情地图 -->
    <el-row type="flex" justify="center">
      <el-col :span="24">
        <div id="china_map" style='height:400px;'></div>
      </el-col>
    </el-row>
    <!-- 依据手机定位显示省级地图 -->
    <el-row v-if="isSuccessLocation" type="flex" justify="center">
      <el-col :span="24">
        <div id="province_map" style='height:400px;'></div>
      </el-col>
    </el-row>
    <!-- 中国疫情数据 -->
    <el-table
      :data="dxyAreaData"
      :header-cell-style="{background:'#eef1f6',color:'#606266'}"
      style="width: 100%;margin-bottom: 20px;font-size: 1rem;"
      row-key="id"
      border
      stripe
      :tree-props="{children: 'cities'}">
      <el-table-column
        prop="name"
        label="地区">
      </el-table-column>
      <el-table-column
        prop="currentConfirmedCount"
        label="现存确诊">
      </el-table-column>
      <el-table-column
        prop="confirmedCount"
        label="累计确诊">
      </el-table-column>
      <el-table-column
        prop="deadCount"
        label="死亡">
      </el-table-column>
      <el-table-column
        prop="curedCount"
        label="治愈">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import echarts from "echarts";
  import 'echarts/map/js/china';
  import {mapState, mapActions} from 'vuex';
  import DataChangeItem from "../../components/DataChangeItem";
  import BMap from 'BMap';
  import {getProvinceGeojson, getProvinceNameJson} from '../../service/getNcovDate';

  export default {
    name: "home",
    components: {DataChangeItem},
    data() {
      return {
        chinaChart: null,
        chinaChartOption: null,
        provinceChart: null,
        provinceChartOption: null,
        changeStatisticDatas: [],
        statisticUpdateTime: '',
        geolocation: null,
        isSuccessLocation: false
      };
    },
    mounted() {
      // 初始化全国疫情地图
      this.initChinaMap();
      // 获取丁香园疫情数据
      this.addDxyData();
      // 获取当前位置,位置获取成功后初始化省级疫情地图
      this.getLocationAndInitProvinceMap();

      // 在屏幕旋转时能自动调整尺寸
      let _this = this;
      window.onresize = function () {
        _this.chinaChart.resize();
        _this.provinceChart.resize();
      };
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
          // 渲染全国疫情地图数据
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
      },

      async getGeojson(provinceName) {
        let resp = await getProvinceNameJson();
        if (resp.status === 200) {
          let data = resp.data;
          if (data !== null) {
            let pinyin = '';
            for (let i = 0; i < data.length; i++) {
              let item = data[i];
              if (provinceName.indexOf(item.provinceName) !== -1) {
                pinyin = item.pinyin;
                break;
              }
            }
            let resp1 = await getProvinceGeojson(pinyin);
            if (resp1.status === 200) {
              return resp1.data;
            } else {
              return null;
            }
          }
        } else {
          return null;
        }
      },


      getLocationAndInitProvinceMap() {
        let _this = this;
        let geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function (r) {
          if (this.getStatus() === BMAP_STATUS_SUCCESS) {
            // 创建地理编码实例
            let myGeo = new BMap.Geocoder();
            // 根据坐标得到地址描述
            myGeo.getLocation(new BMap.Point(r.point.lng, r.point.lat), async function (result) {
              if (result) {
                _this.isSuccessLocation = true;
                let provinceName = result.addressComponents.province;
                // let city = result.addressComponents.city;
                let geojson = await _this.getGeojson(provinceName);
                echarts.registerMap('geojson', geojson);
                // 丁香园数据中的城市名和echarts中有出入，需要调整
                let cities = null;
                for (let i = 0; i < _this.dxyAreaData.length; i++) {
                  let provinceData = _this.dxyAreaData[i];
                  if (provinceName.indexOf(provinceData.provinceName) !== -1) {
                    cities = _this.dxyAreaData[i].cities;
                    break;
                  }
                }
                if (cities !== null) {
                  let provinceCodeNameMap = new Map();
                  for (let n = 0; n < geojson.features.length; n++) {
                    let city = geojson.features[n];
                    provinceCodeNameMap.set(parseInt(city.id), city.properties.name);
                  }
                  for (let i = 0; i < cities.length; i++) {
                    let item = cities[i];
                    if (provinceCodeNameMap.has(item.locationId)) {
                      item.name = provinceCodeNameMap.get(item.locationId);
                    }
                  }
                }
                // 初始化省疫情地图
                _this.initProvinceMap(provinceName, cities);
              }
            });
          }
          else {
            _this.$message('failed' + this.getStatus());
          }
        });
      },

      // 初始化全国疫情地图
      initChinaMap() {
        this.chinaChart = echarts.init(document.getElementById('china_map'));

        // 进行相关配置
        this.chinaChartOption = {
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
          visualMap: { // 左下角的颜色区域
            type: 'piecewise', // 定义为分段型 visualMap
            min: 0,
            max: 1000,
            itemWidth: 8,
            itemHeight: 8,
            bottom: 10,
            orient: 'vertical',
            pieces: [
              {gte: 10000, label: '>10000', color: '#4f070d'},
              {gte: 1000, lte: 9999, label: '1000-9999', color: '#811c24'},
              {gte: 500, lte: 999, label: '500-999', color: '#cb2a2f'},
              {gte: 100, lte: 499, label: '100-499', color: '#e55a4e'},
              {gte: 10, lte: 99, label: '10-99', color: '#f59e83'},
              {gte: 1, lte: 9, label: '1-9', color: '#fdebcf'},
              {value: 0, label: '0', color: '#fff'}
            ]
          },
          geo: { // 地理坐标系组件用于地图的绘制
            map: 'china', // 表示中国地图
            roam: false, // 是否开启鼠标缩放和平移漫游
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
        this.chinaChart.setOption(this.chinaChartOption);
      },

      // 初始化省级疫情地图
      initProvinceMap(provinceName, data) {
        this.provinceChart = echarts.init(document.getElementById('province_map'));

        // 进行相关配置
        this.provinceChartOption = {
          tooltip: { // 鼠标移到图里面的浮动提示框
            formatter(params, ticket, callback) {
              // params.data 就是series配置项中的data数据遍历
              let cityName, confirmedCount, curedCount, deadCount;
              if (params.data) {
                cityName = params.data.cityName;
                confirmedCount = params.data.confirmedCount;
                curedCount = params.data.curedCount;
                deadCount = params.data.deadCount;
              } else { // 为了防止没有定义数据的时候报错写的
                cityName = '';
                confirmedCount = 0;
                curedCount = 0;
                deadCount = 0;
              }
              let htmlStr = `
                <p style='text-align:left;'>
                  <span>城市：${cityName}</span><br/>
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
          visualMap: { // 左下角的颜色区域
            type: 'piecewise', // 定义为分段型 visualMap
            min: 0,
            max: 1000,
            itemWidth: 8,
            itemHeight: 8,
            bottom: 10,
            orient: 'vertical',
            pieces: [
              {gte: 10000, label: '>10000', color: '#4f070d'},
              {gte: 1000, lte: 9999, label: '1000-9999', color: '#811c24'},
              {gte: 500, lte: 999, label: '500-999', color: '#cb2a2f'},
              {gte: 100, lte: 499, label: '100-499', color: '#e55a4e'},
              {gte: 10, lte: 99, label: '10-99', color: '#f59e83'},
              {gte: 1, lte: 9, label: '1-9', color: '#fdebcf'},
              {value: 0, label: '0', color: '#fff'}
            ]
          },
          series: [
            {
              name: '', // 浮动框的标题（上面的formatter自定义了提示框数据，所以这里可不写）
              type: 'map',
              map: 'geojson',
              label: {
                show: true
              },
              // 这是需要配置地图上的某个地区的数据，根据后台的返回的数据进行拼接（下面是我定义的假数据）
              data: data
            }
          ]
        };

        // 使用刚指定的配置项和数据显示地图数据
        this.provinceChart.setOption(this.provinceChartOption);
      }
    }
  };
</script>

<style scoped>
  .home-container {
  }
</style>
