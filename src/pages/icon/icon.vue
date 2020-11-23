<template>
  <view class="body">
    <template v-for="(item,index) in iconList">
      <view class="icon-wrap" :key="index" hover-class="icon-wrap--hover" @tap=selectIcon(item)>
        <img alt="" :src="item.name|getIconUrl"/>
      </view>
    </template>
  </view>
</template>

<script>
import * as icon from '../../apis/icon.js'

export default {
  name: 'icon',
  data () {
    return {
      // 数据列表
      iconList: []
    }
  },
  onShow () {
    this.list()
  },
  methods: {
    // 列出图标
    async list () {
      this.iconList = await icon.list()
    },
    // 选择图标
    selectIcon (item) {
      uni.$emit('changeIcon', item.name)
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.body {
  display: flex;
  flex-wrap: wrap;
  //justify-content: space-around;
}
.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 125px;
  height: 125px;
  & image {
    width: 50px;
    height: 50px;
  }
  &:hover{
    background-color: $uni-bg-color-hover;
  }
}
</style>
