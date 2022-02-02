<template>
    <tui-bottom-popup :show="visible" @close="visible = false">
        <view class="account-title">{{ title }}</view>
        <scroll-view scroll-y class="account-scroll">
            <view class="account-scroll-content">
                <view
                    v-for="(item, index) in list"
                    :key="index"
                    class="account-list-item"
                    @tap="handleSelectAccount(item, index)"
                >
                    <text>{{ item.name }}</text>
                    <!-- <base-icon
                        size="40"
                        :name="item.icon"
                        :title="item.name"
                        :label="item.name"
                        label-margin-left="18"
                    ></base-icon> -->
                    <icon v-if="index === active" type="success" color="#007aff" size="16" />
                </view>
            </view>
        </scroll-view>
    </tui-bottom-popup>
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
        value: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: "选择账户"
        },
        active: {
            type: Number,
            default: -1
        }
    },
    computed: {
        list() {
            return this.$store.state.account;
        },
        visible: {
            get() {
                return this.value;
            },
            set(e) {
                this.$emit("input", e);
            }
        }
    },
    methods: {
        handleSelectAccount(item, index) {
            this.$emit("confirm", item, index);
            this.visible = false;
        },
        handleShow() {
            this.visible = true;
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
    min-height: 50vh;
    max-height: 65vh;

    &-content {
        display: flex;
        flex-direction: column;
        padding: 0 20px;
        background: #fff;

        .account-list-item {
            display: flex;
            justify-content: space-between;
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
