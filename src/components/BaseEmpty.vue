<template>
    <view class="base-empty">
        <base-icon :name="name" color="#c0c4cc" :size="Number(size)" />
        <text class="base-empty-text" :style="{ fontSize: Number(fontSize) + 'rpx' }">暂无数据</text>
    </view>
</template>

<script>
import BaseIcon from "./BaseIcon";
export default {
    name: "BaseEmpty",
    components: { BaseIcon },
    props: {
        fontSize: {
            type: [String, Number],
            default: 28
        },
        size: {
            type: [String, Number],
            default: 100
        },
        name: {
            type: String,
            default: "emptylist"
        },
        description: {
            type: String,
            default: ""
        }
    }
};
</script>

<style scoped lang="scss">
.base-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    &-text {
        color: #c0c4cc;
        margin-top: 20px;
    }
}
</style>
