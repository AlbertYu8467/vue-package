import base from './base';
import axios from '@/request/http'
import qs from 'qs';
const article = {
    articleList(){
        return axios.get(`${base.sq}/toptics`);
    },
    loging(params){
        return axios.post(`${base.sq}/accssstoken`,qs.stringify(params));
    }
    //其他接口
}

export default article;

