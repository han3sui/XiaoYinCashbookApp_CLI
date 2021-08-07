<template>
  <view class="bill">
    <view class="head">
      <view class="head-title">
        <view>年份</view>
        <view>支出</view>
        <view>收入</view>
      </view>
      <view class="head-main">
        <view class="head-time">
          <picker class="head-time-picker" mode="date" :value="date" :start="dateStart" :end="dateEnd" fields="year" @change="handleChangeDate">
            <text>{{date.split('-')[0]}}年</text>
          </picker>
        </view>
        <view class="total-out">{{ $util.formatMoney(data.total_out)||0}}</view>
        <view class="total-in">{{ $util.formatMoney(data.total_income)||0}}</view>
      </view>
    </view>
    <scroll-view scroll-y class="main">
      <template v-if="data.data">
        <view class="main-head">
          <view>月份</view>
          <view>支出</view>
          <view>收入</view>
        </view>
        <view class="main-item" v-for="(item,index) in data.data" :key="index">
          <view class="main-item-month">{{item.month}}月</view>
          <view class="main-item-out">{{ $util.formatMoney(item.out_money)||0}}</view>
          <view class="main-item-in">{{ $util.formatMoney(item.income_money)||0}}</view>
        </view>
      </template>
      <template v-else>
        <base-empty/>
      </template>
    </scroll-view>
  </view>
</template>

<script>
import { bill } from '@/apis/detail'
import BaseEmpty from '../../components/BaseEmpty'

export default {
  name: 'bill',
  components: { BaseEmpty },
  computed: {
    dateStart () {
      return this.$util.getDate('start')
    },
    dateEnd () {
      return this.$util.getDate('end')
    }
  },
  data () {
    return {
      data: {},
      date: this.$util.getDate()
    }
  },
  onShow () {
    this.getBill()
  },
  methods: {
    async getBill () {
      const year = this.date.split('-')[0]
      const res = await bill(year)
      this.data = Object.assign({}, this.data, res)
    },
    handleChangeDate (e) {
      this.date = e.target.value
      this.getBill()
    }
  }
}
</script>

<style scoped lang="scss">
.bill{
  display: flex;
  flex-direction: column;
  .head{
    display: flex;
    flex-direction: column;
    background-color: #f8f8f8;
    height: 10vh;
    justify-content: space-around;
    font-size: 28px;
    font-weight: bold;
    &-title{
      display: flex;
      flex-direction: row;
      & view{
        width: 33.33%;
        text-align: center;
      }
    }
    &-main{
      display: flex;
      flex-direction: row;
      & view{
        width: 33.33%;
        text-align: center;
      }
      .head-time-picker{
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
    }
  }
  .main{
    display: flex;
    flex-direction: column;
    height: 90vh;
    &-head{
      display: flex;
      flex-direction: row;
      padding: 20px 0;
      position: relative;
      & view{
        width: 33.33%;
        text-align: center;
        font-size: 26px;
        color: #7A7E83;
      }
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
    }
    &-item{
      display: flex;
      flex-direction: row;
      position: relative;
      padding: 20px 0;
      & view{
        width: 33.33%;
        text-align: center;
        font-size: 28px;
        color: #000000;
      }
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
    }
  }
}
</style>
