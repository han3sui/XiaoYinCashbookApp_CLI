<template>
  <view class="body">
    <view class="head">
      <view class="head-item">
        <view class="left">
          <picker class="left-account" mode="selector" :value="accountIndex" :range="accountList" range-key="name" @change="handleChangeAccount">
            <text>{{accountList[accountIndex].name}}</text>
          </picker>
          <picker class="left-date" mode="date" :value="date" :start="dateStart" :end="dateEnd" fields="month" @change="handleChangeDate">
            <text>{{date.split('-')[0]}}年{{date.split('-')[1]}}月</text>
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
    <scroll-view scroll-y class="content">
      <list-details/>
<!--      <base-empty v-if="JSON.stringify(data)==='{}' && loadStatus!=='loading' && loadStatus!=='error'"/>-->
<!--      <list-details v-else :list="data" @refresh="listByParams(true)">-->
<!--        <base-load-more :status="loadStatus" icon-type="flower"/>-->
<!--      </list-details>-->
    </scroll-view>
  </view>
</template>

<script>
import * as detail from '../../apis/detail'
import ListDetails from '../../components/ListDetails'
import BaseIcon from '../../components/BaseIcon'
import BaseEmpty from '../../components/BaseEmpty'
import BaseLoadMore from '@/components/BaseLoadMore'

export default {
  components: { BaseLoadMore, BaseEmpty, BaseIcon, ListDetails },
  data () {
    return {
      // 明细列表
      data: {},
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
        page_no: 0,
        page_size: 20
      },
      // 加载状态，支持：loading/finished/error/loadmore
      loadStatus: ''
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
    this.listByParams()
  },
  methods: {
    // 根据查询条件请求
    listByParams (refresh = false) {
      if (refresh) {
        this.params.page_no = 1
        this.data = {}
      } else if (this.loadStatus === 'loading' || this.loadStatus === 'error' || this.loadStatus === 'finished') {
        return
      }
      this.loadStatus = 'loading'
      this.params.year = this.date.split('-')[0]
      this.params.month = this.date.split('-')[1]
      this.params.account_id = this.accountList[this.accountIndex].id
      this.params.page_no = this.params.page_no + 1
      detail.search(this.params).then(res => {
        this.loadStatus = ''
        if (res.length < this.params.page_size) {
          this.loadStatus = 'finished'
        }
        res.forEach(item => {
          if (!this.data[item.time]) {
            this.$set(this.data, item.time, {
              time: item.time,
              income: item.direction === 1 ? item.money : 0,
              out: item.direction === 2 ? item.money : 0,
              list: [item]
            })
          } else {
            if (item.direction === 1) {
              this.data[item.time].income = this.$util.floatAdd(this.data[item.time].income, item.money)
            }
            if (item.direction === 2) {
              this.data[item.time].out = this.$util.floatAdd(this.data[item.time].out, item.money)
            }
            this.data[item.time].list.push(item)
          }
        })
      }).catch(() => {
        this.loadStatus = 'error'
      })
    },
    // 更改时间picker
    handleChangeDate (e) {
      this.date = e.target.value
      this.listByParams(true)
    },
    // 更改显示账户
    handleChangeAccount (e) {
      this.accountIndex = e.target.value
      this.listByParams(true)
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
