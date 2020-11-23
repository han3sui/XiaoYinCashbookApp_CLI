const defaultState =
  {
    // 登录token
    token: null,
    // 用户信息
    userInfo: {
      checkTime: 0,
      avatarUrl: '',
      nickName: '',
      id: 0
    },
    // 分类信息
    category: {},
    // 账户信息
    account: []
  }
const state = {
  ...defaultState,
  initState () {
    return defaultState
  }
}
export default state
