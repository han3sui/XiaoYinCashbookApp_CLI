<template>
  <movable-area :style="[customMovableAreaStyle]">
    <movable-view :y="y" :out-of-bounds="true" :disabled="false" direction="vertical" :style="[customMovableViewStyle]" @change="handleChange">
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
      status: 0
    }
  },
  computed: {
    customMovableAreaStyle () {
      return {
        height: `${this.scrollHeight}vh`,
        width: '100vw',
        overflow: 'hidden'
      }
    },
    customMovableViewStyle () {
      return {
        height: `calc(${this.scrollHeight}vh + ${this.topHeight}rpx)`,
        zIndex: '3',
        width: '100vw',
        marginTop: Number(this.status) === 2 ? 0 : `-${this.topHeight}rpx`
      }
    },
    refreshStyle () {
      return {
        position: 'relative',
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
      this.y = 500
      // this.y = -this.topHeight
    })
  },
  methods: {
    scrolltolower () {
      this.$emit('loadmore')
    },
    handleChange (e) {
      const detail = e.detail
      if (this.status === 3) return
      if (detail.source === 'touch-out-of-bounds') {
        if (e.detail.y >= 20) {
          this.status = 2
        } else {
          this.status = 1
        }
      }
      if (detail.source === 'out-of-bounds') {
        this.status = 3
      }
      console.log(e.detail)
    }
  }
}
</script>

<style scoped lang="scss">
.scroll-view{
  height: 100%;
}
</style>
