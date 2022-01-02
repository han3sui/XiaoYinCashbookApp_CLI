<template>
    <view class="base-load-more">
        <base-loading :show="status === 'loading'" :mode="iconType">加载中...</base-loading>
        <view v-if="status === 'finished'" class="base-load-more__custom">没有更多了</view>
        <view v-if="status === 'error'" class="base-load-more__custom" @tap="retry">加载失败，点击重试</view>
    </view>
</template>

<script>
import BaseLoading from "@/components/BaseLoading";
export default {
    name: "BaseLoadMore",
    components: { BaseLoading },
    props: {
        // 图标样式，支持：circle/flower
        iconType: {
            type: String,
            default: "flower"
        },
        // 加载状态，支持：loading/loadmore/finished/error
        status: {
            type: String,
            default: "loading"
        }
    },
    methods: {
        retry() {
            this.$emit("retry");
        }
    }
};
</script>

<style scoped lang="scss">
.base-load-more {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 5vh;
    &__custom {
        position: relative;
        font-size: 24px;
        color: #c7c7c7;
        &:before,
        &:after {
            position: absolute;
            content: "";
            top: 52%;
            background: #c7c7c7;
            width: 8vw;
            height: 2px;
        }
        &:before {
            left: -10vw;
        }
        &:after {
            right: -10vw;
        }
    }
}
</style>
