import store from '../store/index.js'
import * as util from '../utils/util'
import { login, info } from '../apis/user.js'
import { list as categoryList } from '../apis/category'
import { list as accountList } from '../apis/account'

/**
 * 检查小程序登录状态是否过期
 * @returns {Promise<unknown>}
 */
export function checkSession () {
  return new Promise((resolve, reject) => {
    uni.checkSession({
      success () {
        resolve('微信登录状态有效')
      },
      fail () {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('微信登录状态失效')
      }
    })
  })
}

/**
 * 检查微信授权状态
 * @returns {Promise<unknown>}
 */
export function checkWxAuth () {
  return new Promise((resolve, reject) => {
    uni.getSetting({
      success: result => {
        if (result.authSetting['scope.userInfo'] !== true) {
          uni.showModal({
            title: '授权异常',
            content: '检测未授权，请打开【我的】页面授权',
            showCancel: false
          })
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('授权异常')
        } else {
          resolve('授权正常')
        }
      },
      fail: e => {
        reject(e)
      }
    })
  })
}

/**
 * 拉取用户信息
 * @returns {Promise<unknown>}
 */
export function getUserInfo () {
  return new Promise((resolve, reject) => {
    util.loading('登录中...')
    uni.getUserInfo({
      provider: 'weixin',
      success (info) {
        store.commit('SET_USERINFO', {
          nickName: info.userInfo.nickName,
          avatarUrl: info.userInfo.avatarUrl
        })
        resolve('获取用户信息成功')
        util.hideLoading()
      },
      fail (err) {
        reject(err)
        util.hideLoading()
      }
    })
  })
}

/**
 * 执行登录
 * @returns {Promise<unknown>}
 */
export function doLogin () {
  return new Promise((resolve, reject) => {
    util.loading('登录中...')
    login().then(token => {
      uni.setStorageSync('token', token)
      store.commit('SET_TOKEN', token)
      util.hideLoading()
      initAccount().then(initCategory).then(() => {
        initUserInfo().then(r => {})
        resolve('登录成功')
      }).catch(err => {
        reject(err)
      })
    }).catch(err => {
      reject(err)
      util.hideLoading()
    })
  })
}

/**
 * 初始化用户信息
 * @returns {Promise<void>}
 */
export async function initUserInfo () {
  const res = await info()
  store.commit('SET_USERINFO', {
    checkTime: res.check_time,
    avatarUrl: res.avatar_url,
    nickName: res.nick_name,
    id: res.id
  })
}

/**
 * 初始化分类信息
 * @param force，是否强制更新
 * @returns {Promise<void>}
 */
export async function initCategory (force = false) {
  if (JSON.stringify(store.state.category === '{}') || force === true) {
    const res = await categoryList()
    store.commit('SET_CATEGORY', res)
  }
}

/**
 * 初始化账户信息
 * @param force，是否强制更新
 * @returns {Promise<void>}
 */
export async function initAccount (force = false) {
  if (store.state.account.length === 0 || force === true) {
    const res = await accountList()
    store.commit('SET_ACCOUNT', res)
  }
}
