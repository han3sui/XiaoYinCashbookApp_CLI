<template>
    <view class="cell-item" hover-class="hover">
        <view class="cell-item__container">
            <view class="cell-item__left">
                <base-icon v-if="icon" margin-right="18" :name="icon" :size="iconSize" :title="title" />
                <view class="cell-item__left-title">
                    <text class="title">{{ title }}</text>
                    <text v-if="remark" class="remark">{{ remark }}</text>
                </view>
            </view>
            <view class="cell-item__right">
                <view v-if="note" class="cell-item__right-note">
                    <text class="note">{{ note }}</text>
                </view>
                <view v-if="balance !== null" class="cell-item__right-balance">
                    <text
                        :class="[balance >= 0 ? 'cell-item__right-balance-income' : 'cell-item__right-balance-out']"
                        >{{ $util.formatMoney(balance) }}</text
                    >
                </view>
                <base-icon v-if="arrow" name="arrow-right" size="30" />
            </view>
        </view>
    </view>
</template>

<script>
import BaseIcon from "./BaseIcon";
export default {
    name: "BaseCellItem",
    components: { BaseIcon },
    props: {
        // 标题
        title: {
            type: String,
            default: "",
            require: true
        },
        // 右侧箭头
        arrow: {
            type: Boolean,
            default: false
        },
        // 右侧提示
        note: {
            type: String,
            default: ""
        },
        // 金额余额
        balance: {
            type: Number,
            default: null
        },
        // 图标
        icon: {
            type: String,
            default: ""
        },
        // 图标大小
        iconSize: {
            type: [String, Number],
            default: 40
        },
        // 标题下方提示
        remark: {
            type: String,
            default: ""
        }
    }
};
</script>

<style scoped lang="scss">
.cell-item {
    padding-left: 30px;
    padding-right: 30px;
    &__container {
        display: flex;
        flex-direction: row;
        height: 80px;
        align-items: center;
        justify-content: space-between;
        position: relative;
        font-size: $uni-font-size-base;
        padding: 8px 0;
        .title {
            color: #3b4144;
        }
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
    }
    &__left {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        &-title {
            display: flex;
            flex-direction: column;
            .remark {
                margin-top: 6px;
                color: #999;
                font-size: 24px;
                overflow: hidden;
            }
        }
    }
    &__right {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        &-note {
            font-size: 24px;
            .note {
                color: #999;
            }
        }
        &-balance {
            font-family: Avenir, Helvetica, Arial, sans-serif;
            font-size: 30px;
            font-weight: 600;
            &-income {
                color: #4cd964 !important;
            }
            &-out {
                color: #dd524d !important;
            }
        }
    }
}
</style>
