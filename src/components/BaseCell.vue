<template>
    <view class="cell">
        <view class="cell__container">
            <slot />
        </view>
    </view>
</template>

<script>
export default {
    name: "BaseCell"
};
</script>

<style scoped lang="scss">
.cell {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: auto;
    background-color: #ffffff;
    &__container {
        position: relative;
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
}
</style>
