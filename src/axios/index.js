import store from '../store'
import axios from 'axios'
import qs from 'qs'

axios.defaults.timeout = 5000;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
axios.defaults.baseURL = 'http://192.168.100.105';
//console.log(store.state.accessToken)
//拦截器，axios.interceptors.request.use发送请求前处理 
//axios.interceptors.response.use接受返回后，回调之前处理处理
//POST传参序列化
axios.interceptors.request.use((config) => {
    // if(store.state.username.length=1){//有且只有一个账号登录
    //   config.headers.Authorization=store.state.username.accessToken;
    //   //console.log(store.state.username)
    // }else if(store.state.username.length>1){
    //   //登录账号过多，并未注销
    // }else{
    //   //还未登录
    // }
    if(store.state.accessToken!=''){
      config.headers.Authorization=store.state.accessToken;
    }else{
      //未登录
    }
    return config;
  },(error) =>{
    return Promise.reject(error);
  });
  
//   //返回状态判断
//   axios.interceptors.response.use((res) =>{
//     if(!res.data.success){
//       return Promise.reject(res);
//     }
//     return res;
//   }, (error) => {
//     //404等问题可以在这里处理
//     return Promise.reject(error);
//   });
// //公共方法：
//   export function posts(url, params) {
//     return new Promise((resolve, reject) => {
//       axios.post(url, params)  
//         .then(response => {
//           resolve(response.data);
//         }, err => {
//           reject(err);
//         })
//         .catch((error) => {
//           reject(error)
//         })
//     })
//   }
//   export function gets(url) {
//     return new Promise((resolve, reject) => {
//       axios.get(url)
//         .then(response => {
//           resolve(response.data);
//         }, err => {
//           reject(err);
//         })
//         .catch((error) => {
//           reject(error)
//         })
//     })
//   }
//业务方法
  export default {
    posts(url, params) {
      return new Promise((resolve, reject) => {
        axios.post(url, params)
          .then(response => {
            resolve(response.data);
          }, err => {
            reject(err);
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    gets(url,params) { 
      return new Promise((resolve, reject) => {
        axios.get(url,params)
          .then(response => {
            resolve(response.data);
          }, err => {
            reject(err);
          })
          .catch((error) => {
            reject(error)
          })
      })
    }
  }
