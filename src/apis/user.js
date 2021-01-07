import request from '../utils/request.js'
import store from '../store/index.js'
import config from '@/utils/config'
const url = `${config.API_VERSION}`

/**
 * 用户登录
 * @returns {Promise<unknown>}
 */
export function login () {
  const link = `${url}/token`
  return new Promise(function (resolve, reject) {
    uni.login({
      provider: 'weixin',
      success: function (loginRes) {
        request(link, 'POST', {
          code: loginRes.code,
          nick_name: store.state.userInfo.nickName,
          avatar_url: store.state.userInfo.avatarUrl,
          _loading: '登录中...'
        }, {}, true).then(token => {
          resolve(token)
        }).catch(err => {
          reject(err)
        })
      },
      fail: function (err) {
        reject(err)
      }
    })
  })
}

/**
 * 获取用户信息
 * @returns {Promise<unknown>}
 */
export function info () {
  const link = `${url}/user`
  return request(link, 'GET')
}

/**
 * 更新用户头像、昵称等信息
 * @param data
 * @returns {Promise<unknown>}
 */
export function updateInfo (data = {}) {
  const link = `${url}/user`
  return request(link, 'PUT', data)
}

/**
 * 更新核账时间
 * @returns {Promise | Promise<unknown>}
 */
export function updateCheckTime (content) {
  const link = `${url}/user/checktime`
  return request(link, 'PUT', content)
}

/**
 * 获取核账记录
 * @returns {Promise<unknown>}
 */
export function checkList (params) {
  const link = `${url}/check`
  return request(link, 'GET', { ...params, _loading: false })
}
