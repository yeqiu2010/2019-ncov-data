import {SET_DXYSTATISTICDATA, SET_DXYAREADATA} from './mutation-types';
import {getNcovDataFromDXY} from '../service/getNcovDate';

export default {

  // 从丁香园中获取疫情数据，并写入到vuex中
  async getNcovDataFromDXY({commit, state}) {
    let resp = await getNcovDataFromDXY();
    if (resp.status === 200) {
      let data = resp.data;
      let statisticData = JSON.parse(data.match(/window.getStatisticsService = (.*?)}catch/)[1]);
      let areaData = JSON.parse(data.match(/window.getAreaStat = (.*?)}catch/)[1]);
      for (let i = 0; i < areaData.length; i++) {
        areaData[i].id = i + 1;
        areaData[i].name = areaData[i].provinceShortName;
        areaData[i].value = areaData[i].confirmedCount;
        let cities = areaData[i].cities;
        if (cities.length !== 0) {
          // areaData[i].hasChildren = true;
          for (let j = 0; j < cities.length; j++) {
            cities[j].id = areaData[i].id * 100 + j + 1;
            cities[j].name = cities[j].cityName;
            cities[j].value = cities[j].confirmedCount;
          }
        } else {
          // areaData[i].hasChildren = false;
        }
      }
      commit(SET_DXYSTATISTICDATA, statisticData);
      commit(SET_DXYAREADATA, areaData);
      console.log("更新数据成功！");
      return 1;
    } else {
      console.log("更新数据失败！");
      return 0;
    }
  }
};
