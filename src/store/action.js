import { SET_DXYSTATISTICDATA, SET_DXYAREADATA } from './mutation-types';
import { getNcovDataFromDXY } from '../service/getNcovDate';

export default {
  async getNcovDataFromDXY ({commit, state}){
    let resp = await getNcovDataFromDXY();
    if(resp.status === 200){
      let data = resp.data;
      let statisticData = JSON.parse(data.match(/window.getStatisticsService = (.*?)}catch/)[1]);
      let areaData = JSON.parse(data.match(/window.getAreaStat = (.*?)}catch/)[1])
      for(let i = 0; i < areaData.length; i++){
        areaData[i].name = areaData[i].provinceShortName;
        areaData[i].value = areaData[i].confirmedCount;
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
