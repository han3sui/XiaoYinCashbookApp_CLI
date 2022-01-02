<template>
    <movable-area :style="[customMovableAreaStyle]">
        <movable-view
            :y="y"
            :out-of-bounds="true"
            :disabled="false"
            direction="vertical"
            :style="[customMovableViewStyle]"
            @change="handleChange"
            @touchend="touchend"
        >
            <scroll-view scroll-y class="scroll-view" @scrolltolower="scrolltolower">
                <view :style="[refreshStyle]">
                    <text v-if="status === 1">下拉刷新</text>
                    <text v-if="status === 2">松开更新</text>
                    <!--          <text v-if="status===3">加载中...</text>-->
                    <text v-if="status === 4">加载完成</text>
                </view>
                <slot />
            </scroll-view>
        </movable-view>
    </movable-area>
</template>

<script>
export default {
    name: "BasePullScroll",
    props: {
        // scroll滚动高度，单位vh
        scrollHeight: {
            type: [String, Number],
            default: 90
        },
        // 下拉区域高度，单位rpx
        topHeight: {
            type: [String, Number],
            default: 90
        },
        // 刷新完成
        refreshed: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            // 偏移量
            y: 0,
            // 刷新状态，1: 下拉刷新, 2: 松开更新, 3: 加载中, 4: 加载完成
            status: 1,
            // 定时器
            timer: null
        };
    },
    computed: {
        customMovableAreaStyle() {
            return {
                height: `${this.scrollHeight}vh`,
                width: "100vw",
                overflow: "hidden"
            };
        },
        customMovableViewStyle() {
            return {
                height: `calc(${this.scrollHeight}vh + ${this.topHeight}rpx)`,
                zIndex: "3",
                width: "100vw"
            };
        },
        refreshStyle() {
            return {
                position: "relative",
                height: `${this.topHeight}rpx`,
                fontSize: "24rpx",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            };
        }
    },
    watch: {
        refreshed(e) {
            if (e) {
                this.status = 4;
                this.y = -this.topHeight;
                this.timer && clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.status = 1;
                }, 500);
            }
        }
    },
    created() {
        this.$nextTick(() => {
            this.y = -this.topHeight;
        });
    },
    methods: {
        // scroll触底触发操作
        scrolltolower() {
            this.$emit("loadmore");
        },
        // moveable移动触发
        handleChange(e) {
            const detail = e.detail;
            if (this.status >= 3) return;
            if (detail.y >= 0) {
                this.status = 2;
            } else {
                this.status = 1;
            }
        },
        // movable触发结束
        touchend() {
            if (this.status >= 3) return;
            if (this.status === 2) {
                this.status = 3;
                this.y = 0;
                this.$emit("refresh");
            } else if (this.status === 1) {
                // 必须要加入一个随机值，否则无法触发回弹
                this.y = -this.topHeight + Math.random() / 10;
            }
        }
    }
};
</script>

<style scoped lang="scss">
.scroll-view {
    height: 100%;
}
</style>
