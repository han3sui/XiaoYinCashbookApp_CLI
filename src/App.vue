<script>
import { checkSession, doLogin, initUserInfo, initCategory, initAccount } from "./utils/apis.js";
import store from "./store";
import { checkUpdate } from "./utils/util.js";

export default {
    onLaunch: function () {
        store.commit("SET_TOKEN", uni.getStorageSync("token"));
        initCategory();
        initAccount();
        checkSession().catch(doLogin);
    },
    onShow: function () {
        checkUpdate();
        initUserInfo();
    }
};
</script>

<style lang="scss">
@import "./styles/iconfont.css";
@import "./styles/base.scss";
</style>
