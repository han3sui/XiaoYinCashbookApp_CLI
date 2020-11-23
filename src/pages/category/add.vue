<template>
  <view class="body">
    <view class="form-wrap">
      <view class="form-item">
        <view class="title">分类名称</view>
        <input class="input" v-model="data.name" placeholder="请输入分类名称" placeholder-style="font-size:28rpx"/>
      </view>
      <view v-if="main===false" class="form-item">
        <view class="title">主分类</view>
        <picker @change="selectParentId" :value="parentActive" :range="categoryList" range-key="name">
          <view class="picker-wrap">
            <view class="picker-title">{{categoryList[parentActive].name}}</view>
            <base-icon name="arrow-right"/>
          </view>
        </picker>
      </view>
      <view v-if="main===false" class="form-item">
        <view class="title">分类图标</view>
        <view class="icon-wrap" @tap="toIconList">
          <img :src="icon|getIconUrl"/>
          <base-icon name="arrow-right"/>
        </view>
      </view>
    </view>
    <view class="button-wrap">
      <button type="primary" @tap=save(true)>保存并返回</button>
      <template v-if="!data.id">
        <button type="default" @tap=save(false)>保存并继续</button>
      </template>
    </view>
  </view>
</template>

<script>
import * as category from '../../apis/category'
import BaseIcon from '../../components/BaseIcon'
import { initCategory } from '../../utils/apis'

export default {
  name: 'add',
  components: { BaseIcon },
  data () {
    return {
      // 分类图标
      icon: 'icon-define',
      // 分类详情
      data: {},
      // 分类数组
      categoryList: [],
      // 当前父分类
      parentActive: 0,
      // 分类类型：支出/收入
      type: null,
      // 是否主分类
      main: null
    }
  },
  onLoad (e) {
    uni.$on('changeIcon', (data) => {
      this.icon = data
    })
    this.main = e.main === 'true'
    this.type = e.type
    this.categoryList = this.$store.state.category[e.type]
    if (e.item) {
      const item = JSON.parse(decodeURIComponent(e.item))
      this.data = item
      this.icon = this.data.icon
      this.parentActive = this.categoryList.findIndex(v => v.id === item.parent_id)
    }
    if (e.id) {
      this.parentActive = this.categoryList.findIndex(v => v.id === parseInt(e.id))
    }
  },
  onUnload () {
    uni.$off('changeIcon')
  },
  methods: {
    toIconList () {
      uni.navigateTo({
        url: '../icon/icon'
      })
    },
    selectParentId (e) {
      this.parentActive = e.target.value
    },
    async save (e) {
      try {
        this.data.icon = this.icon
        if (this.main === true) {
          this.data.parent_id = 0
          this.data.icon = undefined
        } else {
          this.data.parent_id = this.categoryList[this.parentActive].id
        }
        this.data.direction = this.$util.getDirection(this.type)
        if (this.data.id) {
          await category.update(this.data)
        } else {
          await category.save(this.data)
        }
        await initCategory(true)
        if (e) {
          uni.navigateBack()
        } else {
          this.data = Object.assign({}, this.data, {
            name: ''
          })
        }
      } catch (e) {
        console.log('分类保存失败:')
        console.log(e)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.form-wrap {
  display: flex;
  flex-direction: column;
  width: 90%;
}

.form-item {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  position: relative;
  padding: 20px 0;

  &:after{
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    height: 1px;
    content: "";
    -webkit-transform: scaleY(.5);
    transform: scaleY(.5);
    background-color: #e5e5e5
  }

  .title {
    width: 30%;
    font-size: 28px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  & input {
    width: 70%;
    text-align: right;
    font-size: 28px;
  }
  & picker{
    width: 70%;
    .picker-wrap{
      display: flex;
      flex-direction: row;
      align-content: flex-end;
      justify-content: flex-end;
      width: 100%;
      .picker-title{
        font-size: 28px;
      }
      & i {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        font-size: 28px;
      }
    }
  }

  .icon-wrap {
    width: 70%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;

    & image {
      width: 50px;
      height: 50px;
    }

    & i {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      font-size: 28px;
    }
  }
}
</style>
