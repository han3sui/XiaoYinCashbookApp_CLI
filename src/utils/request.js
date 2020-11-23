import store from '../store/index.js'
import { loading, hideLoading, random, toastError } from './util'
import { login } from '../apis/user'

// 标记是否正在刷新token
let isRefreshing = false

export function request (api, method = 'GET', params = {}, header = {}) {
  return new Promise(function (resolve, reject) {
    if (params._loading !== false) {
      loading(params._loading)
      delete params._loading
    }
    method === 'GET' && (params._t = random())
    !header['content-type'] && (header['content-type'] = 'application/json')
    let requestUrl
    if (process.env.NODE_ENV === 'development') {
      requestUrl = 'http://dev.hanyin.info'
    } else {
      requestUrl = 'https://cashbook.hanyin.info'
    }
    const token = store.state.token || uni.getStorageSync('token')
    token && (header.Authorization = `Bearer ${token}`)
    const loginCode = [9999]
    const successCode = [200, 201, 202, 203, 204, 205, 206]
    uni.request({
      url: `${requestUrl}${api}`,
      method: method,
      data: params,
      header: header,
      success: (res) => {
        if (successCode.includes(res.statusCode)) {
          // 返回的HTTP状态码是成功的，则直接返回数据
          resolve(res.data)
          hideLoading()
        } else {
          // 返回的HTTP状态码是失败的
          if (loginCode.includes(res.data.code)) {
            // 如果返回的自定义状态码是需要登录的
            if (!isRefreshing) {
              // 如果没有在刷新token，标记当前状态未刷新
              isRefreshing = true
              // 请求登录，刷新token，然后重新请求当前挂起的
              login().then((token) => {
                uni.setStorageSync('token', token)
                store.commit('SET_TOKEN', token)
                request(api, method, params, header).then(r => {
                  resolve(r)
                }).catch(err => {
                  reject(err)
                })
              }).catch(err => {
                reject(err)
              }).finally(() => {
                hideLoading()
                isRefreshing = false
              })
            } else {
              // 如果正在刷新token，添加定时器，如果结束刷新，然后重新请求当前挂起的
              const t = setInterval(() => {
                if (isRefreshing === false) {
                  clearInterval(t)
                  request(api, method, params, header).then(r => {
                    resolve(r)
                  }).catch(err => {
                    reject(err)
                  })
                }
              }, 10)
            }
          } else {
            // 非登录状态码，直接返回错误信息
            let title
            if (!res.data.code) {
              title = '网络错误，请重试'
            } else if (res.data.message) {
              title = res.data.message
            } else {
              title = '服务端返回未知错误'
            }
            toastError(title)
            reject(res.data)
          }
        }
      },
      fail: (err) => {
        // 一般是网络错误了
        toastError(err.errMsg)
        reject(err)
      }
    })
  })
}

export default request
