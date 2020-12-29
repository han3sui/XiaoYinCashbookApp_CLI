import request from '../utils/request.js'
import config from '@/utils/config'
const url = `${config.API_VERSION}/icons`

/**
 * 图标列表
 * @returns {Promise | Promise<unknown>}
 */
export function list () {
  const link = `${url}`
  return request(link, 'GET')
}
