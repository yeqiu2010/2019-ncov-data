import axios from '../fetch/axiosConfig';
import qs from 'qs';

let base = '';
export const postRequest = (url, params) => {
  return axios({
    method: 'post',
    url: `${base}${url}`,
    data: qs.stringify(params, {indices: false}),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

export const getRequest = (url, params) => {
  return axios({
    method: 'get',
    url: `${base}${url}`,
    params: qs.stringify(params, {indices: false}),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

export const uploadFileRequest = (url, params) => {
  return axios({
    method: 'post',
    url: `${base}${url}`,
    data: params,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const putRequest = (url, params) => {
  return axios({
    method: 'put',
    url: `${base}${url}`,
    data: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

export const deleteRequest = (url) => {
  return axios({
    method: 'delete',
    url: `${base}${url}`
  });
};
