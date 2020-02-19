import {getRequest} from "@/fetch/api";

const dxyUrl = 'https://3g.dxy.cn/newh5/view/pneumonia';
const geojsonUrl = 'static/data/map/json';

// 获取丁香园疫情数据
export const getNcovDataFromDXY = () => getRequest('/api/ncovh5/view/pneumonia');

// 加载本地各省的地图json
export const getProvinceGeojson = (provinceName) => getRequest(geojsonUrl + '/province/' + provinceName + '.json');

// 加载本地省名字对应拼音的json
export const getProvinceNameJson = () => getRequest('static/data/provinceName.json');
