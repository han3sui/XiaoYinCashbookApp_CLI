import request from "../utils/request.js";
import config from "@/utils/config";
const url = `${config.API_VERSION}/accounts`;

/**
 * 账户带余额的账户列表
 * @returns {Promise<unknown>}
 */
export function manageList() {
    const link = `${url}/manage-list`;
    return request(link, "GET", {
        _loading: false
    });
}

/**
 * 获取账户关联明细条数
 * @param id，账户ID
 * @returns {Promise<unknown>}
 */
export function getAccountDetailCount(id) {
    const link = `${url}/details/count/${id}`;
    return request(link, "GET");
}

/**
 * 获取账户列表
 * @returns {Promise | Promise<unknown>}
 */
export function list() {
    const link = `${url}`;
    return request(link, "GET", {
        _loading: false
    });
}

/**
 * 保存账户
 * @param data
 * @returns {Promise<unknown>}
 */
export function save(data) {
    const link = `${url}`;
    return request(link, "POST", data);
}

/**
 * 更新账户
 * @param id
 * @param data
 * @returns {Promise | Promise<unknown>}
 */
export function update(id, data) {
    const link = `${url}/${id}`;
    return request(link, "PUT", data);
}

/**
 * 删除账户，同步删除账单
 * @param id
 * @returns {Promise<unknown>}
 */
export function del(id) {
    const link = `${url}/${id}`;
    return request(link, "DELETE");
}
