import { SET_DXYSTATISTICDATA, SET_DXYAREADATA } from './mutation-types';

export default {
  [SET_DXYSTATISTICDATA] (state, data) {
    state.dxyStatisticData = data;
  },

  [SET_DXYAREADATA] (state, data) {
    state.dxyAreaData = data;
  }
};
