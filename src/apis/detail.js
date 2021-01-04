import request from '../utils/request.js'
import config from '@/utils/config'
const url = `${config.API_VERSION}/details`

/**
 * 明细列表
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function search (params = {}) {
  const link = `${url}`
  params._loading = false
  return request(link, 'GET', params)
}

/**
 * 获取明细总额
 * @param params
 * @returns {Promise<unknown>}
 */
export function listMoney (params = {}) {
  const link = `${url}/money`
  params._loading = false
  return request(link, 'GET', params)
}

/**
 * 保存明细
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function save (params = {}) {
  const link = `${url}`
  return request(link, 'POST', params)
}

/**
 * 删除明细
 * @param id
 * @returns {Promise | Promise<unknown>}
 */
export function del (id) {
  const link = `${url}/${id}`
  return request(link, 'DELETE')
}

/**
 * 更新明细
 * @param id
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function update (id, params = {}) {
  const link = `${url}/${id}`
  return request(link, 'PUT', params)
}

/**
 * 获取年度账单
 * @param year
 * @returns {Promise | Promise<unknown>}
 */
export function bill (year) {
  const link = `${url}/bill/${year}`
  return request(link, 'GET')
}

/**
 * 获取图表账单
 * @param params
 * @returns {Promise | Promise<unknown>}
 */
export function chart (params = {}) {
  const link = `${url}/chart`
  return request(link, 'GET', params)
}

/**
 * 检查是否存在未核账
 * @param time
 * @returns {Promise | Promise<unknown>}
 */
export function isExistUnchek (time) {
  const link = `${url}/uncheck/${time}`
  return request(link, 'GET')
}

/**
 * 获取记账总天数
 * @returns {Promise | Promise<unknown>}
 */
export function getAllDays () {
  const link = `${url}/days`
  return request(link, 'GET', {
    _loading: false
  })
}

/**
 * 获取报销账单
 * @param claim,0：非报销，1：待报销，2：已报销
 * @returns {Promise<unknown>}
 */
export function getClaim (claim = 1) {
  const link = `${url}/claim/${claim}`
  return request(link)
}

/**
 * 批量报销
 * @param data
 * @returns {Promise | Promise<unknown>}
 */
export function batchUpdateClaim (data) {
  const link = `${url}/claim`
  return request(link, 'POST', data)
}
