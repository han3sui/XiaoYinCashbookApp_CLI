<template>
  <movable-area :style="[customMovableAreaStyle]">
    <movable-view :y="y" :out-of-bounds="true" :disabled="false" vertical="vertical" :style="[customMovableViewStyle]" @change="handleChange">
      <scroll-view scroll-y class="scroll-view" @scrolltolower="scrolltolower">
        <view :style="[refreshStyle]">
          <text v-if="status===1">下拉刷新</text>
          <text v-if="status===2">松开更新</text>
          <text v-if="status===3">加载中...</text>
        </view>
        <slot/>
      </scroll-view>
    </movable-view>
  </movable-area>
</template>

<script>
export default {
  name: 'BasePullScroll',
  props: {
    // scroll滚动高度
    scrollHeight: {
      type: [String, Number],
      default: 90
    },
    // 下拉区域高度，单位rpx
    topHeight: {
      type: [String, Number],
      default: 60
    }
  },
  data () {
    return {
      // 偏移量
      y: 0,
      // 刷新状态，1: 下拉刷新, 2: 松开更新, 3: 加载中, 4: 加载完成
      status: 1
    }
  },
  computed: {
    customMovableAreaStyle () {
      return {
        height: `${this.scrollHeight}vh`,
        width: '100vw'
      }
    },
    customMovableViewStyle () {
      return {
        height: `calc(${this.scrollHeight}vh - ${this.topHeight}rpx)`,
        width: '100vw'
      }
    },
    refreshStyle () {
      return {
        height: `${this.topHeight}rpx`,
        fontSize: '24rpx',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }
  },
  created () {
    this.$nextTick(() => {
      this.y = -this.topHeight
    })
  },
  methods: {
    scrolltolower () {
      this.$emit('loadmore')
    },
    handleChange (e) {
      console.log(e)
    }
  }
}
</script>

<style scoped lang="scss">
.scroll-view{
  height: 100%;
}
</style>
