/**
 * axios 封装
 * 请求拦截、响应拦截、错误统一处理
 */
import axios from 'axios';
// import router from '../router';
// import store from '../store/index';
//import { Toast } from 'vant';

/**
 * 提示函数
 */
const tip = msg => {
    Toast({
        message:msg,
        duration:1000,
        forbidClick:true
    })
}

/**
 * 转跳到登录页
 * 携带当前页面路由，在登录完成后返回当前页面
 */
const toLogin = () => {
    router.replace({
        path:'/login',
        query: {
            redirect:router.currentRoute.fullPath
        }
    })
}

/**
 * 请求失败后统一处理错误
 */
const errorHandle = (status, other) => {
    //状态码判断
    switch (status){
        //未登录，转跳得到登录页
        case 401:
            toLogin();
            break;
        //403 token过期
        //清除token 并返回登录页
        case 403:
            tip('登录过期，请重新登录');
            localStorage.removeItem('token');
            store.commit('loginSuccess',null);
            setTimeout( () => {
                toLogin();
            },1000);
            break;
        case 404:
            tip('请求的资源不存在');
            break;
        default:
            console.log(other);

    }
}

//创建axios实例
var instance  = axios.create({ timeout:1000* 12 });
//设置post请求头
instance.defaults.headers.post(['Content-Type'] = 'application/x-www-form-urlencoded');
/**
 * 请求拦截器
 * 每次请求前，如果存在token则在请求头中携带token
 */
instance.interceptors.request.use(
    config => {
        //登录流程控制中，根据本地是否存在token判断用户的登录情况
        //即使token存在也有可能过期，所以每次在请求头中携带token
        const token = store.state.token;
        token && ( config.headers.Authorization = token );
        return config;
    },
    error => Promise.error(error)
)

/**
 * 响应拦截器
 */
instance.interceptors.response.use( 
    res =>res.status === 200 ? Promise.resolve(res): Promise.reject(res),
    error => {
        const { response } = error;
        if(response) {
            //请求已发出，但不在2xx的范围
            errorHandle( response.status, response.data.message);
            return Promise.reject(response);
        }else{
            //处理断网的情况
            //eg：请求超时或者断网，更新state的network状态
            //
            if( !window.navigator.onLine){
                store.commit('changeNetwork',false);
            }else{
                return Promise.reject(error);
            }
        }
    }
)

export default instance;

//main.js
//import api from './api'
//Vue.prototype.$api = api

