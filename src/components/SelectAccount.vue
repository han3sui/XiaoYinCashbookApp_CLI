<template>
    <view>
        <view class="select-account-slot-title" @click="handleShow"> {{ list[active].name }}</view>
        <u-popup :show="visible" position="bottom" :safe-area-inset-bottom="true">
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
                            label="item.name"
                            label-margin-left="18"
                        ></base-icon>
                        <icon v-if="index === active" type="success" size="16" />
                    </view>
                </view>
            </scroll-view>
        </u-popup>
    </view>
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
        title: {
            type: String,
            default: "选择账户"
        },
        active: {
            type: Number,
            default: -1
        }
    },
    data() {
        return {
            visible: false
        };
    },
    computed: {
        // activeAcount() {
        //     const account = this.list.filter((item) => item.id === this.id)[0];
        //     console.log(account, this.list, this.id);
        //     return account;
        // },
        list() {
            console.log(this.$store.state.account);
            return this.$store.state.account;
        }
    },
    // watch: {
    //     id() {
    //         console.log("============", this.id);
    //     },
    //     visible: {
    //         handler(e) {
    //             console.warn("======", e, new Date());
    //         },
    //         immediate: true
    //     }
    // },
    methods: {
        handleSelectAccount(item) {
            this.$emit("change", item);
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
