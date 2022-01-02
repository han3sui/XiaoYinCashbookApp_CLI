<template>
    <base-popup v-model="visible" position="bottom" :safe-area-inset-bottom="true">
        <view class="account-title">{{ title }}</view>
        <scroll-view scroll-y class="account-scroll">
            <view class="account-scroll-content">
                <view
                    v-for="(item, index) in list"
                    :key="index"
                    class="account-list-item"
                    @tap="handleSelectAccount(item)"
                >
                    <base-icon
                        size="40"
                        :name="item.icon"
                        :title="item.name"
                        :label="item.name"
                        label-margin-left="18"
                    />
                </view>
            </view>
        </scroll-view>
    </base-popup>
</template>

<script>
import BasePopup from "@/components/BasePopup";
import BaseIcon from "@/components/BaseIcon";
export default {
    name: "SelectAccount",
    comments: {
        BasePopup,
        BaseIcon
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: "选择报销入账账户"
        },
        all: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        list() {
            if (this.all) {
                return [
                    {
                        id: 0,
                        name: "保持原账户",
                        icon: "jinzhi"
                    },
                    ...this.$store.state.account
                ];
            } else {
                return this.$store.state.account;
            }
        }
    },
    methods: {
        handleSelectAccount(item) {
            this.$emit("change", item);
        }
    }
};
</script>

<style lang="scss" scoped>
.account-title {
    font-size: 26px;
    font-weight: bold;
    padding: 30px 0 30px 20px;
    background-color: #f8f8f8;
}
.account-scroll {
    max-height: 55vh;

    &-content {
        display: flex;
        flex-direction: column;
        padding: 0 20px;
        background: #fff;

        .account-list-item {
            display: flex;
            position: relative;
            padding: 25px 10px;
            font-size: 24px;

            &:not(:last-child):after {
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

            &:active {
                background-color: #eeeeee;
            }
        }
    }
}
</style>
