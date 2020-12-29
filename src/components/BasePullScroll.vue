<template>
  <movable-area>
    <movable-view>
      <scroll-view scroll-y :style="[customScrollStyle]" @scrolltolower="scrolltolower">
        <view class="scroll-refresh"></view>
        <slot/>
      </scroll-view>
    </movable-view>
  </movable-area>
</template>

<script>
export default {
  name: 'BasePullScroll',
  props: {
    scrollHeight: {
      type: [String, Number],
      default: 90
    }
  },
  computed: {
    // Scroll内联样式
    customScrollStyle () {
      return {
        height: `${this.height}vh`
      }
    }
  },
  methods: {
    scrolltolower () {
      this.$emit('loadmore')
    }
  }
}
</script>

<style scoped lang="scss">

</style>
