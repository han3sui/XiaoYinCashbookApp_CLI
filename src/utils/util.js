import dayjs from 'dayjs'
/**
 * 加载loading
 * @param title
 */
export function loading (title) {
  uni.showLoading({
    title: title || '加载中...',
    mask: true
  })
}

/**
 * 隐藏loading
 */
export function hideLoading () {
  uni.hideLoading()
}

/**
 * 成功提示
 * @param title
 */
export function toastSuccess (title) {
  uni.showToast({
    icon: 'success',
    title: title,
    duration: 1500
  })
}

/**
 * 错误提示
 * @param title
 */
export function toastError (title) {
  uni.showToast({
    icon: 'none',
    title: title,
    duration: 3000
  })
}

/**
 * 获取对应类型
 * @param type
 * @returns {*}
 */
export function getDirection (type) {
  const map = {
    income: 1,
    out: 2
  }
  if (type in map) {
    return map[type]
  } else {
    toastError('支出类型参数错误')
  }
}

/**
 * 生成随机数
 * @returns {string}
 */
export function random () {
  return `${(Math.random() * 10000000).toString(16).substr(0, 4)}${new Date().getTime()}${Math.random().toString().substr(2, 5)}`
}

/**
 * 获取当前日期代表周几
 * @param date,日期
 * @returns {string}
 */
export function getWeekDay (date) {
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const myDate = new Date(Date.parse(date))
  return week[myDate.getDay()]
}

/**
 *获取picker时间
 * @param type
 * @returns {string}
 */
export function getDate (type) {
  const date = new Date()

  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()

  if (type === 'start') {
    year = year - 10
  }
  month = month > 9 ? month : '0' + month
  day = day > 9 ? day : '0' + day
  return `${year}-${month}-${day}`
}

/**
 * 计算适配px值
 * @param px，传入750宽度下px值
 * @returns {number}
 */
export function getRealPx (px = 60) {
  const screenWitdh = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  return ((screenWitdh * 2) / 750) * px
}

// 定义全局zIndex值
let zIndex = 2000
/**
 * 获取Popup的Index
 * @returns {number}
 */
export function getZIndex () {
  const v = zIndex
  zIndex++
  return v
}

/**
 * 格式化时间戳
 * @param utime
 * @param format
 * @returns {string}
 */
export function dateFormat (utime, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!utime) {
    return ''
  } else {
    if (utime.toString().length === 10) {
      return dayjs.unix(utime).format(format)
    } else {
      return dayjs(utime).format(format)
    }
  }
}

/**
 * 格式化金额
 * @param amount
 * @param decimalCount
 * @param decimal
 * @param thousands
 * @returns {string}
 */
export function formatMoney (amount, decimalCount = 2, decimal = '.', thousands = ',') {
  try {
    if (typeof amount !== 'number') {
      return amount
    }
    const amountStr = '' + amount
    const amountArr = amountStr.split('.')
    const negativeSign = /-/.exec(amountStr) ? '-' : ''
    let main = /\d.*/.exec(amountArr[0]) || ''
    if (main) {
      main = main[0]
    }
    if (main.length > 3) {
      main = main.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
    }
    let decimal = ''
    if (amountArr.length > 1) {
      decimal = amountArr[1].length === 2 ? `.${amountArr[1]}` : `.${amountArr[1]}0`
    } else {
      decimal = '.00'
    }
    return `${negativeSign}${main}${decimal}`
  } catch (e) {
    console.log('格式化金额失败')
    console.log(e)
    return amount
  }
  // try {
  //   decimalCount = Math.abs(decimalCount)
  //   decimalCount = isNaN(decimalCount) ? 2 : decimalCount
  //   const negativeSign = amount < 0 ? '-' : ''
  //   const i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString()
  //   const j = (i.length > 3) ? i.length % 3 : 0
  //   return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : '')
  // } catch (e) {
  //   console.log(e)
  // }
}
