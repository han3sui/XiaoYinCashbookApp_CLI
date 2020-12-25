<template>
  <view class="body">
    <view class="head">
      <view class="head-item">
        <view class="left">
          <picker class="left-account" mode="selector" :value="accountIndex" :range="accountList" range-key="name" @change="handleChangeAccount">
            <text>{{accountList[accountIndex].name}}</text>
          </picker>
          <picker class="left-date" mode="date" :value="date" :start="dateStart" :end="dateEnd" fields="month" @change="handleChangeDate">
            <text>{{params.year}}年{{params.month}}月</text>
          </picker>
        </view>
        <view hover-class="hover" class="right" @tap="handleToSearch">
          <base-icon name="search" color="#666" size="40" label="搜索"/>
        </view>
      </view>
      <view class="head-item">
        <view class="left">
          <text class="left-out">支出: {{$util.formatMoney(totalOut)}}</text>
          <text class="left-income">收入: {{$util.formatMoney(totalIncome)}}</text>
        </view>
      </view>
    </view>
    <scroll-view scroll-y class="content" @scrolltolower="loadmore=true">
      <list-details :loadmore.sync="loadmore" :params="params" path="index"/>
    </scroll-view>
  </view>
</template>

<script>
import ListDetails from '../../components/ListDetails'
import BaseIcon from '../../components/BaseIcon'

export default {
  components: { BaseIcon, ListDetails },
  data () {
    return {
      // 总支出
      totalOut: 0,
      // 总收入
      totalIncome: 0,
      // 时间picker的显示时间
      date: this.$util.getDate(),
      // 当前显示账户
      accountIndex: 0,
      // 搜索条件
      params: {
        year: 0,
        month: 0,
        account_id: 0,
        category_id: 0,
        remark: '',
        check_time: 0
      },
      // 加载更多
      loadmore: false
    }
  },
  computed: {
    // 开始时间
    dateStart () {
      return this.$util.getDate('start')
    },
    // 结束时间
    dateEnd () {
      return this.$util.getDate('end')
    },
    // 组装账户列表
    accountList () {
      let list = []
      list = JSON.parse(JSON.stringify(this.$store.state.account))
      list.unshift({
        id: 0,
        name: '全部账户'
      })
      return list
    }
  },
  onShow () {
    this.params.year = this.date.split('-')[0]
    this.params.month = this.date.split('-')[1]
  },
  onUnload () {
    console.log('unload')
  },
  methods: {
    // 更改时间picker
    handleChangeDate (e) {
      this.date = e.target.value
      this.params.year = this.date.split('-')[0]
      this.params.month = this.date.split('-')[1]
    },
    // 更改显示账户
    handleChangeAccount (e) {
      this.accountIndex = e.target.value
      this.params.account_id = this.accountList[this.accountIndex].id
    },
    // 前往搜索页
    handleToSearch () {
      uni.navigateTo({
        url: '/pages/search/search'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.body{
  .head{
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 10vh;
    padding: 0 20px;
    box-shadow: 0 2px 16px 0 #c0c0c0;
    &-item{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      .left{
        display: flex;
        flex-direction: row;
        &-account{
          font-size: 28px;
          & text{
            position: relative;
            &:after{
              display: block;
              content: '';
              border-width: 15px 10px;
              border-style: solid;
              border-color: #333 transparent transparent transparent;
              position: absolute;
              top: 12px;
              right: -30px;
            }
          }
        }
        &-date{
          margin-left: 50px;
          font-size: 28px;
          & text{
            position: relative;
            &:after{
              display: block;
              content: '';
              border-width: 15px 10px;
              border-style: solid;
              border-color: #333 transparent transparent transparent;
              position: absolute;
              top: 12px;
              right: -30px;
            }
          }
        }
        &-out{
          font-size: 28px;
          color: #666;
        }
        &-income{
          margin-left: 20px;
          font-size: 28px;
          color: #666;
        }
      }
    }
  }
  .content{
    height: 90vh;
  }
}
</style>
