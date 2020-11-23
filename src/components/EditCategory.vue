<template>
  <view class="body" :style="{height: `${Number(scrollHeight)}px`}">
    <scroll-view class="left" scroll-y :scroll-top="leftScrollTop" scroll-with-animation>
      <template v-for="(item,index) in category[map[direction]]">
        <view :key="index" class="left-item" :class="[index===active?'left-item-active':'']" @tap="selectCategory(index)">{{item.name}}</view>
      </template>
    </scroll-view>
    <scroll-view class="right" scroll-y :scroll-top="rightScrollTop" scroll-with-animation @scroll="rightScroll">
      <template v-for="(v1,v1index) in category[map[direction]]">
        <view :key="v1index" class="category-container" :style="v1index===(category[map[direction]].length-1)&&`min-height:${Number(scrollHeight-20)}px`">
          <view class="category-title">{{v1.name}}</view>
          <view class="category-wrap">
            <template v-for="(v2,v2index) in v1.nodes">
              <view :key="v2index" class="category-item" :class="[(v2.id===currentId||v2.income_account_id===incomeId)?'category-item-active':'']" @tap="handleSelect(v2)">
                <base-icon size="50" :name="v2.icon|getIconUrl" :title="v2.name"/>
                <view class="category-item-title">{{v2.name}}</view>
              </view>
            </template>
          </view>
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<script>
import BaseIcon from '../components/BaseIcon'

export default {
  name: 'EditCategory',
  components: { BaseIcon },
  props: {
    // 竖向滚动最大高度
    scrollHeight: {
      type: [Number, String],
      default: 0
    },
    // 类别类型，1:收入，2:支出，3:转账
    direction: {
      type: [Number, String],
      default: 2
    }
  },
  data () {
    return {
      // 类型map
      map: {
        1: 'income',
        2: 'out',
        3: 'transfer'
      },
      // 左侧滚动条距离顶部高度
      leftScrollTop: 0,
      // 右边栏目scroll-view的滚动条高度
      rightScrollTop: 0,
      // 选中类别
      active: 0,
      // 右侧每个item到顶部距离
      rightItemTop: [],
      // 当前选中的ID
      currentId: 0,
      // 转入账户ID
      incomeId: 0
    }
  },
  computed: {
    // 类别数据
    category () {
      const map = {}
      Object.assign(map, this.$store.state.category)
      const incomeAccountList = this.$store.state.account.map(item => {
        return {
          income_account_id: item.id,
          name: item.name,
          icon: item.icon
        }
      })
      map.transfer = [{
        name: '转出账户',
        nodes: this.$store.state.account
      }, {
        name: '转入账户',
        nodes: incomeAccountList
      }]
      return map
    }
  },
  watch: {
    // 分类数据变更，重新获取右侧子分类到顶部的距离
    category () {
      setTimeout(() => {
        this.getRightItemTop()
      }, 100)
    },
    // 收支模式变更，重新获取右侧子分类到顶部的距离
    direction (e) {
      setTimeout(() => {
        this.getRightItemTop()
      }, 100)
    }
  },
  mounted () {
    this.getRightItemTop()
  },
  methods: {
    // 左侧scroll选择主分类
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
    // 右侧scroll子分类滚动触发
    rightScroll (e) {
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
    // 获取右侧scroll每个分类到顶部的距离
    getRightItemTop () {
      uni.createSelectorQuery().in(this).selectAll('.category-container').boundingClientRect((res) => {
        // 如果节点尚未生成，rects值为[](因为用selectAll，所以返回的是数组)，循环调用执行
        if (!res.length) {
          setTimeout(() => {
            this.getRightItemTop()
          }, 100)
          return
        }
        this.rightItemTop = []
        res.forEach(item => {
          // 这里减去res[0].top，是因为第一项顶部可能不是贴到导航栏(比如有个搜索框的情况)
          this.rightItemTop.push(item.top - res[0].top)
        })
      }).exec()
    },
    // 选择分类
    handleSelect (item) {
      this.currentId = item.id
      this.incomeId = item.income_account_id
    }
  }
}
</script>

<style scoped lang="scss">
.body{
  display: flex;
  flex-direction: row;
  padding: 0 20px;
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
    background-color: #fafafa;
    .category-container{
      display: flex;
      flex-direction: column;
      background-color: #FFFFFF;
      margin: 20px;
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
          width: 25%;
          height: 130px;
          &-title{
            margin-top: 5px;
            font-size: 24px;
            font-weight: 400;
          }
          &-active{
            background-color: $uni-bg-color-hover;
          }
        }
      }
    }
  }
}
</style>
