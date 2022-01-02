import request from "../utils/request.js";
import config from "@/utils/config";
const url = `${config.API_VERSION}/category`;

/**
 * 分类列表
 * @returns {Promise | Promise<unknown>}
 */
export function list() {
    const link = `${url}`;
    return request(link, "GET", {
        _loading: false
    });
}

/**
 * 删除分类，同步删除账单
 * @param id
 * @returns {Promise<unknown>}
 */
export function del(id) {
    const link = `${url}/${id}`;
    return request(link, "DELETE");
}

/**
 * 新增分类
 * @param data
 * @returns {Promise | Promise<unknown>}
 */
export function save(data) {
    const link = `${url}`;
    return request(link, "POST", data);
}

/**
 * 更新分类
 * @param data
 * @returns {Promise<unknown>}
 */
export function update(data) {
    const link = `${url}/${data.id}`;
    return request(link, "PUT", data);
}

/**
 * 获取分类关联的明细数量
 * @param id
 * @returns {Promise<unknown>}
 */
export function getDetailsCount(id) {
    const link = `${url}/details/count/${id}`;
    return request(link, "GET");
}
