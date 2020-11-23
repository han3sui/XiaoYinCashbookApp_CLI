import request from '../utils/request.js'
const url = '/api/v2/icons'

/**
 * 图标列表
 * @returns {Promise | Promise<unknown>}
 */
export function list () {
  const link = `${url}`
  return request(link, 'GET')
}
