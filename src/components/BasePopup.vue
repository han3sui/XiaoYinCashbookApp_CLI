<template>
  <view class="base-popup" v-if="visible">
    <view class="overlay" :style="[overlayStyle,overlayAnimation]" :class="overlayClass" @tap="overlayClick"/>
    <view class="popup-body" :style="[bodyStyle]" :class="[safeAreaInsetBottom?'safe-area-inset-bottom':'',bodyClass]">
      <slot/>
    </view>
  </view>
</template>

<script>
import { getZIndex } from '@/utils/util'

export default {
  name: 'BasePopup',
  props: {
    // 显示状态
    value: {
      type: Boolean,
      default: false
    },
    // 弹出位置
    position: {
      type: String,
      default: 'center'
    },
    // 圆角值
    radius: {
      type: [Number, String],
      default: 0
    },
    // 是否显示遮罩
    overlay: {
      type: Boolean,
      default: true
    },
    // 点击遮罩层关闭
    closeByOverlay: {
      type: Boolean,
      default: true
    },
    // 是否显示关闭按钮
    closeable: {
      type: Boolean,
      default: false
    },
    // 关闭按钮位置
    closePosition: {
      type: String,
      default: 'top-right'
    },
    // 底部安全区
    safeAreaInsetBottom: {
      type: Boolean,
      default: false
    },
    // 动画过度时间
    duration: {
      type: [Number, String],
      default: 0.3
    }
  },
  data () {
    return {
      // 显隐控制
      visible: this.value,
      // 内容主体样式
      bodyClass: '',
      // 遮罩样式
      overlayClass: '',
      // 遮罩动画
      overlayAnimation: {
        animation: ''
      },
      // 是否从内部关闭
      closeFromInner: false
    }
  },
  computed: {
    overlayStyle () {
      const style = {}
      style.zIndex = getZIndex()
      return style
    },
    bodyStyle () {
      const style = {}
      style.position = 'fixed'
      style.maxHeight = '100%'
      style.overflowY = 'auto'
      style.backgroundColor = '#fff'
      style.zIndex = getZIndex()
      switch (this.position) {
        case 'center':
          style.top = '50%'
          style.left = '50%'
          style.transform = 'translate3d(-50%, -50%, 0)'
          break
        case 'left':
          style.left = 0
          style.bottom = 0
          style.height = '100%'
          style.borderRadius = `0 ${this.radius}rpx ${this.radius}rpx 0`
          break
        case 'right':
          style.right = 0
          style.bottom = 0
          style.height = '100%'
          style.borderRadius = `${this.radius}rpx 0 0 ${this.radius}rpx`
          break
        case 'top':
          style.left = 0
          style.top = 0
          style.width = '100%'
          style.borderRadius = `0 0 ${this.radius}rpx ${this.radius}rpx`
          break
        case 'bottom':
          style.left = 0
          style.bottom = 0
          style.width = '100%'
          style.borderRadius = `${this.radius}rpx ${this.radius}rpx 0 0`
          break
        default:
      }
      style.overflow = 'hidden'
      return style
    }
  },
  watch: {
    value (e) {
      if (e) {
        this.open()
      } else if (!this.closeFromInner) {
        this.close()
      }
      this.closeFromInner = false
    },
    visible (e) {
      this.$emit('input', e)
    }
    // value: {
    //   immediate: true,
    //   handler (e) {
    //     if (e) {
    //       this.open()
    //     } else if (!this.closeFromInner) {
    //       this.close()
    //     }
    //     this.closeFromInner = false
    //   }
    // },
    // visible: {
    //   immediate: true,
    //   handler (e) {
    //     this.$emit('input', e)
    //   }
    // }
    // visible: {
    //   immediate: true,
    //   handler (e) {
    //     this.$emit('input', e)
    //     if (e) {
    //       this.bodyClass = `pop-body-slide-${this.position}-in`
    //       if (this.overlay) {
    //         // this.overlayAnimation.animation = `fadeIn ${this.duration}s forwards`
    //         this.overlayClass = 'overlay-fade-in'
    //       }
    //     } else {
    //       this.close()
    //     }
    //   }
    // }
  },
  methods: {
    overlayClick () {
      if (this.closeByOverlay) {
        this.closeFromInner = true
        this.close()
      }
    },
    open () {
      this.visible = true
      this.bodyClass = `pop-body-slide-${this.position}-in`
      if (this.overlay) {
        this.overlayClass = 'overlay-fade-in'
      }
    },
    close () {
      if (this.overlay) {
        this.overlayClass = 'overlay-fade-out'
      }
      this.bodyClass = `pop-body-slide-${this.position}-out`
      setTimeout(() => {
        this.visible = false
      }, 400)
    }
  }
}
</script>

<style scoped lang="scss">
@keyframes fadeIn {
  0%{
    opacity: 0;
  }
  100%{
    opacity: 0.6;
  }
}
.base-popup {
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    background: #333333;
    opacity: 0;
    &-fade-in{
      animation: fadeIn .4s forwards;
    }
    &-fade-out{
      animation: fadeOut .4s;
      @keyframes fadeOut {
        0%{
          opacity: 0.6;
        }
        100%{
          opacity: 0;
        }
      }
    }
  }
  .pop-body {
    &-slide-top-in{
      animation:  topIn .4s;
      @keyframes topIn {
        0% {
          transform: translate3d(0, -100%, 0);
        }
        100% {
          transform: translate3d(0, 0, 0);
        }
      }
    }
    &-slide-top-out{
      animation: topOut .3s;
      @keyframes topOut {
        0% {
          transform: translate3d(0, 0, 0);
        }
        100% {
          transform: translate3d(0, 100%, 0);
        }
      }
    }
    &-slide-left-in{
      animation:  leftIn .4s;
      @keyframes leftIn {
        0% {
          transform: translate3d(-100%, 0, 0);
        }
        100% {
          transform: translate3d(0, 0, 0);
        }
      }
    }
    &-slide-right-in{
      animation:  rightIn .4s;
      @keyframes rightIn {
        0% {
          transform: translate3d(100%, 0, 0);
        }
        100% {
          transform: translate3d(0, 0, 0);
        }
      }
    }
    &-slide-bottom-in {
      animation:  bottomIn .4s;
      @keyframes bottomIn {
        0% {
          transform: translate3d(0, 100%, 0);
        }
        100% {
          transform: none;
        }
      }
    }
    &-slide-left-out{
      animation: leftOut .3s;
      @keyframes leftOut {
        0% {
          transform: translate3d(0, 0, 0);
        }
        100% {
          transform: translate3d(-100%, 0, 0);
        }
      }
    }
    &-slide-right-out{
      animation: rightOut .3s;
      @keyframes rightOut {
        0% {
          transform: translate3d(0, 0, 0);
        }
        100% {
          transform: translate3d(100%, 0, 0);
        }
      }
    }
    &-slide-bottom-out {
      animation: bottomOut .3s;
      @keyframes bottomOut {
        0% {
          transform: translate3d(0, 0, 0);
        }
        100% {
          transform: translate3d(0, 100%, 0);
        }
      }
    }

    &-slide-top-enter,
    &-slide-top-out {
      transform: translate3d(0, -100%, 0);
    }

    &-slide-right-enter,
    &-slide-right-out {
      transform: translate3d(100%, -50%, 0);
    }

    &-slide-bottom-enter,
    &-slide-bottom-out {
      transform: translate3d(0, 100%, 0);
    }

    &-slide-left-enter,
    &-slide-left-out {
      transform: translate3d(-100%, -50%, 0);
    }
  }
}
</style>
