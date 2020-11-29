<template>
  <view class="body">
    <template v-if="isImg">
      <view class="icon-wrap">
        <text class="icon-wrap-text" v-if="name.indexOf('icon-define.png')!==-1">{{title.substr(0,1)}}</text>
        <img class="icon-wrap-img" :style="[imgStyle]" alt="" :src="name"/>
      </view>
    </template>
    <template v-else>
      <view class="base-icon" :class="[`base-icon-${name}`]" :style="[iconStyle]"/>
      <text :style="[labelStyle]" v-if="label">{{label}}</text>
    </template>
  </view>
</template>

<script>
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
    // icon大小
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
    }
  },
  computed: {
    isImg () {
      return this.name.indexOf('/') !== -1
    },
    iconStyle () {
      let style = {}
      style = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: this.size === 'inherit' ? this.size : `${this.size}rpx`,
        width: `${this.size}rpx`,
        height: `${this.size}rpx`
      }
      this.color && (style.color = this.color)
      return style
    },
    imgStyle () {
      let style = {}
      style = {
        width: `${this.size}rpx`,
        height: `${this.size}rpx`
      }
      return style
    },
    labelStyle () {
      let style = {}
      style = {
        fontSize: this.size === 'inherit' ? this.size : `${this.size / 1.5}rpx`
      }
      this.color && (style.color = this.color)
      return style
    }
  }
}
</script>

<style lang="scss" scoped>
.body{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  .icon-wrap{
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    height: 100%;
    &-img{
      width: 100%;
      height: 100%;
    }
    &-text{
      position: absolute;
      color: #FFFFFF;
      font-size: 24px;
    }
  }
}
</style>
