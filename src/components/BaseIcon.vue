<template>
  <view class="icon-body" :style="[iconBodyStyle]">
    <view class="icon-wrap">
      <template v-if="isImg">
        <!--      网络图片-->
        <text v-if="name.indexOf('icon-define')!==-1" :style="[textStyle]">{{ title.substr(0, 1) }}</text>
        <img :style="[imgStyle]" alt="" :src="setImageUrl(name)"/>
      </template>
      <template v-else>
        <!--      字体图标-->
        <text :class="['base-icon',`base-icon-${name}`]" :style="[iconStyle]"/>
      </template>
    </view>
    <text :style="[labelStyle]" v-if="label">{{ label }}</text>
  </view>
</template>

<script>
import config from '@/utils/config'
export default {
  name: 'BaseIcon',
  props: {
    // icon或者图片链接
    name: {
      type: String,
      default: ''
    },
    // 用于无图标的时候(icon-define)填充首字符
    title: {
      type: String,
      default: ''
    },
    // icon大小，单位rpx
    size: {
      type: [Number, String],
      default: 'inherit'
    },
    // icon颜色
    color: {
      type: String,
      default: ''
    },
    // icon后面的字符串
    label: {
      type: String,
      default: ''
    },
    // 右边距，单位rpx
    marginRight: {
      type: [String, Number],
      default: 0
    },
    // label左边距，单位rpx
    labelMarginLeft: {
      type: [String, Number],
      default: 0
    }
  },
  computed: {
    isImg () {
      return this.name.indexOf('icon-') !== -1 || this.name.indexOf('/') !== -1
    },
    iconBodyStyle () {
      return {
        marginRight: `${this.marginRight}rpx`
      }
    },
    iconStyle () {
      let style = {}
      style = {
        fontSize: this.size === 'inherit' ? this.size : `${this.size}rpx`,
        lineHeight: this.size === 'inherit' ? this.size : `${this.size}rpx`
      }
      this.color && (style.color = this.color)
      return style
    },
    imgStyle () {
      let style = {}
      style = {
        width: this.size === 'inherit' ? '50rpx' : `${this.size}rpx`,
        height: this.size === 'inherit' ? '50rpx' : `${this.size}rpx`
      }
      return style
    },
    labelStyle () {
      let style = {}
      style = {
        fontSize: this.size === 'inherit' ? this.size : `${this.size / 1.5}rpx`,
        marginLeft: `${this.labelMarginLeft}rpx`
      }
      this.color && (style.color = this.color)
      return style
    },
    textStyle () {
      return {
        position: 'absolute;',
        color: '#FFFFFF',
        fontSize: this.size === 'inherit' ? '24rpx' : `${this.size / 2}rpx`,
        lineHeight: this.size === 'inherit' ? '24rpx' : `${this.size / 2}rpx`
      }
    }
  },
  methods: {
    setImageUrl (name) {
      if (name.indexOf('icon-') !== -1) {
        return `${config.CDN_URL}/icon/${name}.png`
      } else {
        return name
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.icon-body {
  display: flex;
  align-items: center;
  justify-content: center;

  .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
}
</style>
