<template>
  <movable-area :style="[customMovableAreaStyle]">
    <movable-view :y="y" vertical="vertical" :style="[customMovableViewStyle]" @change="handleChange">
      <scroll-view scroll-y :style="[customScrollStyle]" @scrolltolower="scrolltolower">
        <view :style="[refreshStyle]">
          <text>下拉刷新...</text>
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
      y: -this.topHeight
    }
  },
  computed: {
    // Scroll内联样式
    customScrollStyle () {
      return {
        height: '100%'
        // height: `${this.scrollHeight}vh`
      }
    },
    customMovableAreaStyle () {
      return {
        height: `${this.scrollHeight}vh`,
        width: '100vw'
      }
    },
    customMovableViewStyle () {
      return {
        height: `calc(${this.scrollHeight}vh + ${this.topHeight}rpx)`,
        width: '100vw'
      }
    },
    refreshStyle () {
      return {
        height: `${this.topHeight}rpx`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }
  },
  created () {
    console.log(this.y)
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

</style>
