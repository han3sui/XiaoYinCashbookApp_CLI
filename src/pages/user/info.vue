<template>
    <view class="body">
        <view class="cell-wrap">
            <view class="cell-item">
                <view class="item-left">头像</view>
                <view class="item-right">
                    <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
                        <image :src="tmpUserInfo.avatarUrl" class="avatar" />
                    </button>
                </view>
            </view>
            <view class="cell-item">
                <view class="item-left">昵称</view>
                <view class="item-right">
                    <input
                        :value="tmpUserInfo.nickName"
                        type="nickname"
                        class="weui-input"
                        placeholder="请输入昵称"
                        @input="onKeyInput"
                    />
                </view>
            </view>
        </view>
        <button class="btn" @click="handleUpdate">更新</button>
    </view>
</template>
<script>
import { toastError, loading, hideLoading } from "../../utils/util";
import { uploadFile, updateInfo } from "@/apis/user.js";

export default {
    data() {
        return {
            tmpUserInfo: {}
        };
    },
    computed: {
        token() {
            return this.$store.state.token;
        },
        userInfo() {
            return this.$store.state.userInfo;
        }
    },
    watch: {
        userInfo: {
            deep: true,
            immediate: true,
            handler(newVal) {
                this.tmpUserInfo = JSON.parse(JSON.stringify(newVal));
            }
        }
    },
    methods: {
        async onChooseAvatar(e) {
            const avatarUrl = e.detail.avatarUrl;
            if (!avatarUrl) {
                toastError("获取头像失败");
                return;
            }
            try {
                loading();
                const res = await uploadFile(avatarUrl);
                this.tmpUserInfo.avatarUrl = res.url;
                hideLoading();
            } catch (e) {
                toastError(e.message || e.errMsg || "上传头像失败");
            }
        },
        handleUpdate() {
            const { avatarUrl: avatar_url, nickName: nick_name } = this.tmpUserInfo;
            updateInfo({
                avatar_url,
                nick_name
            })
                .then(() => {
                    this.$store.commit("SET_USERINFO", {
                        ...this.$store.state.userInfo,
                        ...{ avatarUrl: avatar_url, nickName: nick_name }
                    });
                    uni.showToast({
                        title: "更新成功",
                        icon: "none"
                    });
                })
                .catch((err) => {
                    toastError(err.message);
                });
        },
        onKeyInput(e) {
            this.tmpUserInfo.nickName = e.detail.value;
        }
    }
};
</script>
<style scoped lang="scss">
.body {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f2f2f2;
    .cell-wrap {
        margin-top: 20px;
        background-color: #fff;
        .cell-item {
            display: flex;
            flex-direction: row;
            height: 100px;
            align-items: center;
            justify-content: space-between;
            padding: 0 30px;
            border-bottom: 1px solid #f2f2f2;

            .item-right {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;

                .avatar-wrapper {
                    position: relative;
                    width: 90px;
                    height: 90px;
                    border: none;
                    border-radius: 50%;
                    &::after {
                        border: none;
                    }
                    .avatar {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                    }
                }
                .weui-input {
                    color: #999;
                    text-align: right;
                }
            }
        }
    }
    .btn {
        background-color: #1aad19;
        color: #fff;
        width: 600px;
        border-radius: 100px;
        margin-top: 40px;
    }
}
</style>
