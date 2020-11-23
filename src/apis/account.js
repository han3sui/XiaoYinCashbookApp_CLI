import request from '../utils/request.js'
const url = '/api/v2/accounts'

/**
 * 账户带余额的账户列表
 * @returns {Promise<unknown>}
 */
export function manageList () {
  const link = `${url}/manage-list`
  return request(link, 'GET', {
    _loading: false
  })
}

/**
 * 获取账户列表
 * @returns {Promise | Promise<unknown>}
 */
export function list () {
  const link = `${url}`
  return request(link, 'GET', {
    _loading: false
  })
}

/**
 * 保存账户
 * @param data
 * @returns {Promise<unknown>}
 */
export function save (data) {
  const link = `${url}`
  return request(link, 'POST', data)
}

/**
 * 更新账户
 * @param id
 * @param data
 * @returns {Promise | Promise<unknown>}
 */
export function update (id, data) {
  const link = `${url}/${id}`
  return request(link, 'PUT', data)
}

/**
 * 删除账户，同步删除账单
 * @param id
 * @returns {Promise<unknown>}
 */
export function del (id) {
  const link = `${url}/${id}`
  return request(link, 'DELETE')
}
