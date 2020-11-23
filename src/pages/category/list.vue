<template>
  <view class="body">
    <view class="left">
      <scroll-view scroll-y :scroll-top="leftScrollTop" scroll-with-animation :style="{maxHeight: scrollHeight+'px'}">
        <template v-for="(item,index) in category[type]">
          <view :key="index" class="left-item" :class="[index===active?'left-item-active':'']" @tap="selectCategory(index)">{{item.name}}</view>
        </template>
      </scroll-view>
      <view class="left-item" hover-class="hover" @tap="handleAdd"><i class="iconfont icon-arrow-right"/>新增</view>
    </view>
    <view class="right">
      <scroll-view scroll-y :scroll-top="rightScrollTop" scroll-with-animation class="scroll-right" @scroll="rightScroll">
        <template v-for="(v1,v1index) in category[type]">
          <view :key="v1index" class="category-container">
            <view class="category-title">{{v1.name}}</view>
            <view class="category-wrap">
              <template v-for="(v2,v2index) in v1.nodes">
                <view :key="v2index" class="category-item" hover-class="hover" @tap="handleEdit(v2)">
                  <base-icon size="50" :name="v2.icon|getIconUrl" :title="v2.name"/>
                  <view class="category-item-title">{{v2.name}}</view>
                </view>
              </template>
              <view class="category-item" hover-class="hover" @tap="handleSet(v1)">
                <base-icon size="50" name="setting"/>
                <view class="category-item-title">管理</view>
              </view>
            </view>
          </view>
        </template>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import * as category from '../../apis/category'
import BaseIcon from '../../components/BaseIcon'
import { initCategory } from '../../utils/apis'

export default {
  name: 'list',
  components: { BaseIcon },
  data () {
    return {
      // 类别类型，income,out
      type: null,
      // 竖向滚动最大高度
      scrollHeight: 0,
      // 左侧滚动条距离顶部高度
      leftScrollTop: 0,
      // 右边栏目scroll-view的滚动条高度
      rightScrollTop: 0,
      // 选中类别
      active: 0,
      // 右侧每个item到顶部距离
      rightItemTop: []
    }
  },
  computed: {
    // 类别数据
    category () {
      return this.$store.state.category
    }
  },
  watch: {
    category () {
      setTimeout(() => {
        this.getRightItemTop()
      }, 100)
    }
  },
  onLoad (e) {
    // 设置支出模式还是收入模式
    this.type = e.type
    switch (e.type) {
      case 'income':
        uni.setNavigationBarTitle({
          title: '收入类别管理'
        })
        break
      case 'out':
        uni.setNavigationBarTitle({
          title: '支出类别管理'
        })
        break
      default:
        uni.setNavigationBarTitle({
          title: '类别管理'
        })
    }
    uni.createSelectorQuery().in(this).select('#header').boundingClientRect().exec((res) => {
      if (res.length > 0 && res[0]) {
        this.scrollHeight = (uni.getSystemInfoSync().windowHeight - res[0].height - res[0].top)
      } else {
        this.scrollHeight = (uni.getSystemInfoSync().windowHeight - 20 - 48 - 10)
      }
    })
  },
  onReady () {
    this.getRightItemTop()
  },
  methods: {
    selectCategory (e, disable) {
      if (this.rightItemTop.length === 0) {
        this.getRightItemTop()
      }
      if (e === this.active) return
      this.$nextTick(() => {
        if (!disable) {
          this.rightScrollTop = this.rightItemTop[e]
        }
        // 设置选中
        this.active = e
        // 将菜单活动item垂直居中
        this.leftScrollTop = e * 48 + 48 / 2 - this.scrollHeight / 2
      })
    },
    rightScroll (e) {
      // 如果到顶部的距离不足，直接设定到了第一个item，防止抖动
      if (e.detail.scrollTop <= 48 / 2) {
        this.selectCategory(0, true)
        return
      }
      setTimeout(() => {
        const scrollHeight = e.detail.scrollTop + 48 / 2
        for (let i = 0; i < this.rightItemTop.length; i++) {
          const height1 = this.rightItemTop[i]
          const height2 = this.rightItemTop[i + 1]
          // 如果不存在height2，意味着数据循环已经到了最后一个，设置左边菜单为最后一项即可
          if (!height2 || (scrollHeight >= height1 && scrollHeight < height2)) {
            this.selectCategory(i, true)
            return
          }
        }
      }, 10)
    },
    getRightItemTop () {
      uni.createSelectorQuery().selectAll('.category-container').boundingClientRect((res) => {
        // 如果节点尚未生成，rects值为[](因为用selectAll，所以返回的是数组)，循环调用执行
        if (!res.length) {
          setTimeout(() => {
            this.getRightItemTop()
          }, 10)
          return
        }
        this.rightItemTop = []
        res.forEach(item => {
          // 这里减去res[0].top，是因为第一项顶部可能不是贴到导航栏(比如有个搜索框的情况)
          this.rightItemTop.push(item.top - res[0].top)
        })
      }).exec()
    },
    handleSet (item) {
      uni.showActionSheet({
        itemList: ['添加子分类', '编辑主分类', '删除主分类'],
        success: (e) => {
          switch (e.tapIndex) {
            case 0:
              uni.navigateTo({
                url: `/pages/category/add?type=${this.type}&id=${item.id}`
              })
              break
            case 1:
              uni.navigateTo({
                url: `/pages/category/add?item=${encodeURIComponent(JSON.stringify(item))}&type=${this.type}&main=true`
              })
              break
            case 2:
              uni.showModal({
                title: '提示',
                content: '请确保该主分类下无子分类 , 请慎重操作 !',
                success: async (res) => {
                  if (res.confirm) {
                    await category.del(item.id)
                    this.$util.toastSuccess('删除成功')
                    await initCategory(true)
                  }
                }
              })
              break
            default:
              this.$util.toastError('无效的选项')
          }
        }
      })
    },
    handleAdd () {
      uni.navigateTo({
        url: `./add?type=${this.type}&main=true`
      })
    },
    handleEdit (item) {
      uni.showActionSheet({
        itemList: ['查看明细', '编辑分类', '删除分类'],
        success: (e) => {
          switch (e.tapIndex) {
            case 0:
              uni.navigateTo({
                url: '/pages/search/search?params=' + encodeURIComponent(JSON.stringify({
                  category_id: item.id
                }))
              })
              break
            case 1:
              uni.navigateTo({
                url: `/pages/category/add?item=${encodeURIComponent(JSON.stringify(item))}&type=${this.type}`
              })
              break
            case 2:
              category.getDetailsCount(item.id).then((res) => {
                uni.showModal({
                  title: '提示',
                  content: `该操作将删除关联的 ${res} 条账单明细，请慎重操作！`,
                  success: async (res) => {
                    if (res.confirm) {
                      await category.del(item.id)
                      this.$util.toastSuccess('删除成功')
                      await initCategory(true)
                    }
                  }
                })
              })
              break
            default:
              this.$util.toastError('无效的选项')
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.body{
  display: flex;
  flex-direction: row;
  padding: 20px;
  .left{
    width: 20%;
    border-radius: 10px;
    background-color: #f6f6f6;
    .left-item{
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 96px;
      font-size: 24px;
      font-weight: 400;
    }
    .left-item-active{
      background-color: #FFFFFF;
      position: relative;
      &:before{
        content: "";
        position: absolute;
        border-left: 8px solid #2979ff;
        height: 28px;
        left: 0;
        top: 34px;
      }
    }
  }
  .right{
    flex: 1;
    height: 95vh;
    background-color: #fafafa;
    .scroll-right{
      height: 100%;
    }
    .category-container{
      display: flex;
      flex-direction: column;
      background-color: #FFFFFF;
      margin: 20px;
      &:last-child{
        min-height: 93vh;
      }
      .category-title{
        font-size: 24px;
        font-weight: 700;
        margin-top: 10px;
        margin-left: 10px;
      }
      .category-wrap{
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        background-color: #FFFFFF;
        .category-item{
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 130px;
          height: 130px;
          .category-item-title{
            margin-top: 5px;
            font-size: 24px;
            font-weight: 400;
          }
        }
      }
    }
  }
}
</style>
