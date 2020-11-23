<template>
  <view class="base-subsection" :style="[baseStyle]">
    <view class="base-subsection-item" :style="[itemStyle(index)]" v-for="(item,index) in list" :key="index"
          @tap="click(index)">
      <view :style="[textStyle(index)]">{{ item }}</view>
    </view>
    <view :style="[itemSwipeStyle]"/>
  </view>
</template>

<script>
export default {
  name: 'BaseSubsection',
  props: {
    // tab数组
    list: {
      type: Array,
      default () {
        return []
      }
    },
    // 当前激活元素
    current: {
      type: [Number, String],
      default: 0
    },
    // 激活元素的颜色
    activeColor: {
      type: String,
      default: '#19be6b'
    },
    // 激活元素背景颜色
    activeBgColor: {
      type: String,
      default: '#ffffff'
    },
    // 未激活元素的颜色
    inActiveColor: {
      type: String,
      default: '#606266'
    },
    // 激活字体是否加粗
    bold: {
      type: Boolean,
      default: true
    },
    // 字体大小rpx
    size: {
      type: [Number, String],
      default: 28
    },
    // 圆角大小rpx
    borderRadius: {
      type: [Number, String],
      default: 10
    },
    // item内边距 rpx
    padding: {
      type: [Number, String],
      default: 6
    }
  },
  computed: {
    baseStyle () {
      const style = {}
      style.padding = `${this.padding}rpx`
      style.borderRadius = `${Number(this.borderRadius) - 4}rpx`
      return style
    },
    itemStyle () {
      return index => {
        const style = {}
        style.width = `${100 / this.list.length}%`
        return style
      }
    },
    textStyle () {
      return index => {
        const style = {}
        style.fontSize = `${this.size}rpx`
        style.padding = `${this.borderRadius}rpx 0`
        if (index === Number(this.currentIndex)) {
          style.color = this.activeColor
          style.fontWeight = this.bold ? 'bold' : ''
        } else {
          style.color = this.inActiveColor
        }
        return style
      }
    }
  },
  watch: {
    current: {
      immediate: true,
      handler (v) {
        this.currentIndex = v
      }
    }
  },
  data () {
    return {
      // 当前选中tab
      currentIndex: this.current,
      // 背景滑块样式
      itemSwipeStyle: {},
      // 每个tab子item的宽度
      itemWidthList: []
    }
  },
  mounted () {
    this.initTabInfo()
    this.initItemSwipeStyle()
  },
  methods: {
    initTabInfo () {
      uni.createSelectorQuery().in(this).selectAll('.base-subsection-item').boundingClientRect((res) => {
        if (!res.length) {
          setTimeout(() => {
            this.initTabInfo()
          }, 100)
          return
        }
        this.itemWidthList = []
        res.forEach(item => {
          this.itemWidthList.push(item.width)
        })
      }).exec()
    },
    initItemSwipeStyle () {
      if (!this.itemWidthList.length) {
        setTimeout(() => {
          this.initItemSwipeStyle()
        }, 100)
        return
      }
      const style = {}
      style.backgroundColor = this.activeBgColor
      style.position = 'absolute'
      style.borderRadius = `${this.borderRadius}rpx`
      style.bottom = `${this.borderRadius}rpx`
      // style.left = `${this.borderRadius}rpx`
      style.left = `${this.itemWidthList[this.current] * this.current + Number(this.padding)}px`
      style.top = `${this.borderRadius}rpx`
      style.width = `${this.itemWidthList[0] - Number(this.padding)}px`
      this.itemSwipeStyle = Object.assign({}, this.itemSwipeStyle, style)
    },
    click (index) {
      if (index === this.currentIndex) return
      this.currentIndex = index
      this.moveSection(index)
      this.$emit('change', Number(index))
    },
    moveSection (index) {
      if (!this.itemWidthList.length) {
        setTimeout(() => {
          this.moveSection()
        }, 100)
        return
      }
      this.$set(this.itemSwipeStyle, 'transition', 'all 0.35s')
      this.$set(this.itemSwipeStyle, 'left', `${this.itemWidthList[index] * index + Number(this.padding)}px`)
      // this.$set(this.itemSwipeStyle, 'width', `${this.itemWidthList[index] - Number(this.padding)}px`)
    }
  }
}
</script>

<style scoped lang="scss">
.base-subsection {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #eeeeef;
  position: relative;
  width: 500px;
  &-item {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
}
</style>
