const mutations = {
    SET_TOKEN(state, res) {
        state.token = res;
    },
    SET_USERINFO(state, res) {
        Object.keys(res).forEach((key) => {
            state.userInfo[key] = res[key];
        });
    },
    SET_CATEGORY(state, res) {
        state.category = res;
    },
    SET_ACCOUNT(state, res) {
        state.account = res;
    },
    ADD_CHANGE_DETAIL(state, res) {
        state.changeDetails.push(res);
    },
    CLEAR_CHANGE_DETAIL(state) {
        state.changeDetails = [];
    },
    SET_EDIT_DETAIL(state, res) {
        state.editDetailOld = res;
    },
    CLEAR_VUEX(state) {
        if (state.initState && typeof state.initState === "function") {
            const initState = state.initState();
            for (const key in initState) {
                if (Object.prototype.hasOwnProperty.call(initState, key)) {
                    state[key] = initState[key];
                }
            }
        }
    }
};
export default mutations;
