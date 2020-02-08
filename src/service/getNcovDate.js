import {getRequest} from "@/fetch/api";

const dxyUrl = 'https://3g.dxy.cn/newh5/view/pneumonia';
export const getNcovDataFromDXY = () => getRequest('/api/ncovh5/view/pneumonia');
