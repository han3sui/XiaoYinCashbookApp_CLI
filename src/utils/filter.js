import dayjs from "dayjs";
import config from "@/utils/config";

/**
 * 拼接Icon网络地址
 * @param name，icon名称
 * @returns {string}
 */
export function getIconUrl(name) {
    return `${config.CDN_URL}/icon/${name}.png`;
}

/**
 * 格式化时间戳
 * @param utime
 * @param format
 * @returns {string}
 */
export function formatDate(utime, format = "YYYY-MM-DD HH:mm:ss") {
    if (!utime) {
        return "";
    } else {
        if (utime.toString().length === 10) {
            return dayjs.unix(utime).format(format);
        } else {
            return dayjs(utime).format(format);
        }
    }
}
