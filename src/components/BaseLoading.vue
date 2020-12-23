<template>
  <view v-if="show" class="base-loading">
    <view v-if="mode==='circle'" class="loading__circle" :style="[loadingStyle]"></view>
    <view v-if="mode==='flower'" class="loading__flower" :style="[loadingStyle]">
      <view class="loading__flower-base" :style="[flowerBaseStyle]" :class="[`loading__flower-${index}`]"
            v-for="index in 4" :key="index"/>
    </view>
    <view class="loading__text" :style="[textStyle]">
      <slot/>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BaseLoading',
  props: {
    // 动画类型，支持：circle/flower
    mode: {
      type: String,
      default: 'circle'
    },
    // 动画和文字颜色
    color: {
      type: String,
      default: '#c7c7c7'
    },
    // 加载图标大小
    size: {
      type: [String, Number],
      default: '34'
    },
    // 加载文字大小
    textSize: {
      type: [String, Number],
      default: '24'
    },
    // 显示状态
    show: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    textStyle () {
      return {
        fontSize: `${this.textSize}rpx`,
        color: `${this.color}`
      }
    },
    loadingStyle () {
      const style = {}
      style.width = `${this.size}rpx`
      style.height = `${this.size}rpx`
      if (this.mode === 'circle') {
        style.borderColor = `#e5e5e5 #e5e5e5 #e5e5e5 ${this.color};`
      }
      return style
    },
    flowerBaseStyle () {
      return {
        width: `${this.size / 2.5}rpx`,
        height: `${this.size / 2.5}rpx`,
        background: `${this.color}`
      }
    }
  }
}
</script>

<style scoped lang="scss">
@keyframes circle-rotate {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes antSpinMove {
  to {
    opacity: 1;
  }
}

@keyframes antRotate {
  to {
    transform: rotate(405deg);
  }
}

.base-loading {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  .loading__circle {
    background: 0 0;
    border-radius: 50%;
    border: 2px solid;
    animation: circle-rotate 1s linear infinite;
  }

  .loading__flower {
    position: relative;
    display: inline-block;
    transform: rotate(45deg);
    animation: antRotate 1.2s infinite linear;

    &-base {
      border-radius: 100%;
      transform: scale(0.75);
      display: block;
      position: absolute;
      opacity: 0.3;
      animation: antSpinMove 1s infinite linear alternate;
      transform-origin: 50% 50%;
    }

    &-0 {
      left: 0;
      top: 0;
    }

    &-1 {
      right: 0;
      top: 0;
      animation-delay: 0.4s;
    }

    &-2 {
      right: 0;
      bottom: 0;
      animation-delay: 0.8s;
    }

    &-3 {
      left: 0;
      bottom: 0;
      animation-delay: 1.2s;
    }
  }

  .loading__text {
    padding-left: 15px;
  }
}
</style>
