<template>
    <view class="body">
        <view class="form-wrap">
            <view class="form-item">
                <view class="title">账户名称</view>
                <input
                    v-model="data.name"
                    class="input"
                    placeholder="请输入账户名称"
                    placeholder-style="font-size:28rpx"
                />
            </view>
            <view class="form-item">
                <view class="title">账户余额</view>
                <input
                    v-model="data.balance"
                    class="input"
                    type="digit"
                    placeholder="请输入账户余额"
                    placeholder-style="font-size:28rpx"
                />
            </view>
            <view class="form-item">
                <view class="title">账户图标</view>
                <view class="icon-wrap" @tap="toIconList">
                    <img :src="icon | getIconUrl" alt="" />
                    <base-icon name="arrow-right" />
                </view>
            </view>
            <view class="form-item">
                <view class="title">计入总资产</view>
                <checkbox-group @change="handleCheckbox">
                    <checkbox style="transform: scale(0.8)" value="1" :checked="data.add_total !== 0" />
                </checkbox-group>
            </view>
            <view class="form-item">
                <view class="title">排序</view>
                <input
                    v-model.number="data.sort"
                    class="input"
                    type="number"
                    placeholder="请输入排序"
                    placeholder-style="font-size:28rpx"
                />
            </view>
        </view>
        <view class="button-wrap">
            <button type="primary" @tap="save(true)">保存并返回</button>
            <template v-if="!data.id">
                <button type="default" @tap="save(false)">保存并继续</button>
            </template>
        </view>
    </view>
</template>

<script>
import * as account from "../../apis/account.js";
import BaseIcon from "../../components/BaseIcon";
import { initAccount } from "../../utils/apis";

export default {
    name: "Add",
    components: { BaseIcon },
    data() {
        return {
            // 默认显示icon
            icon: "icon-define",
            // 账户数据
            data: {
                balance: null,
                icon: null,
                name: null,
                add_total: 1
            },
            // 临时余额
            tmpBalance: null
        };
    },
    onLoad(e) {
        // 监听Icon图标更换
        uni.$on("changeIcon", (data) => {
            this.icon = data;
        });
        if (e.item) {
            const item = JSON.parse(decodeURIComponent(e.item));
            this.data = item;
            this.tmpBalance = item.balance;
            this.icon = this.data.icon;
        }
    },
    onUnload() {
        uni.$off("changeIcon");
    },
    methods: {
        // 前往图标页面
        toIconList() {
            uni.navigateTo({
                url: "/pages/icon/icon"
            });
        },
        // 保存账户
        async save(e) {
            try {
                this.data.icon = this.icon;
                this.data.balance = Number(this.data.balance);
                if (this.data.id) {
                    this.data.tmp_balance = this.tmpBalance;
                    await account.update(this.data.id, this.data);
                } else {
                    await account.save(this.data);
                }
                await initAccount(true);
                if (e) {
                    uni.navigateBack();
                } else {
                    this.data = Object.assign({}, this.data, {
                        name: "",
                        balance: ""
                    });
                }
            } catch (e) {
                console.log("账户保存失败:");
                console.log(e);
            }
        },
        // 标记账户是否计入统计
        handleCheckbox(e) {
            if (e.target.value.length) {
                this.data.add_total = 1;
            } else {
                this.data.add_total = 0;
            }
        }
    }
};
</script>

<style scoped lang="scss">
.body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.form-wrap {
    display: flex;
    flex-direction: column;
    width: 90%;
}

.form-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    position: relative;
    padding: 20px 0;
    &:after {
        position: absolute;
        bottom: 0;
        right: 0;
        left: 0;
        height: 1px;
        content: "";
        -webkit-transform: scaleY(0.5);
        transform: scaleY(0.5);
        background-color: #e5e5e5;
    }

    .title {
        width: 30%;
        font-size: 28px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    & input {
        width: 70%;
        text-align: right;
        font-size: 28px;
    }

    .icon-wrap {
        width: 70%;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        & image {
            width: 50px;
            height: 50px;
        }
    }
}
</style>
