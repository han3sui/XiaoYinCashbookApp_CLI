const mutations = {
  SET_TOKEN (state, res) {
    state.token = res
  },
  SET_USERINFO (state, res) {
    Object.keys(res).forEach(key => {
      state.userInfo[key] = res[key]
    })
  },
  SET_CATEGORY (state, res) {
    state.category = res
  },
  SET_ACCOUNT (state, res) {
    state.account = res
  },
  CLEAR_VUEX (state) {
    if (state.initState && typeof state.initState === 'function') {
      const initState = state.initState()
      for (const key in initState) {
        state[key] = initState[key]
      }
    }
  }
}
export default mutations
