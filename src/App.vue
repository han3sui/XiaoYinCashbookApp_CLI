<script>
import { checkSession, doLogin, initUserInfo, initCategory, initAccount } from "./utils/apis.js";
import store from "./store";

export default {
    onLaunch: function () {
        store.commit("SET_TOKEN", uni.getStorageSync("token"));
        initCategory();
        initAccount();
        checkSession().catch(doLogin);
    },
    onShow: function () {
        initUserInfo();
    }
};
</script>

<style lang="scss">
@import "uview-ui/index.scss";
@import "./styles/iconfont.css";
@import "./styles/base.scss";
</style>
