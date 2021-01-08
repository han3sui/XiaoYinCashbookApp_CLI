<template>
  <view class="body">
    <view class="head">
      <view class="head-title">
        <view>资产</view>
        <view>负债</view>
        <view>余额</view>
      </view>
      <view class="head-main">
        <view>{{$util.formatMoney(all_balance)}}</view>
        <view>{{$util.formatMoney(all_liabilities)}}</view>
        <view>{{$util.formatMoney(all_surplus)}}</view>
      </view>
    </view>
    <scroll-view scroll-y class="cell-wrap">
      <base-cell>
        <template v-for="(item,index) in list">
          <base-cell-item :title="item.name" :key="index" :remark="!item.add_total?'不计入总资产':''" :balance="item.balance" :icon="item.icon" icon-size="50" @tap="handleEdit(item)"/>
        </template>
      </base-cell>
    </scroll-view>
    <view class="bottom">
      <view class="button-wrap">
        <button type="primary" @tap="handleAdd">添加账户</button>
        <button type="default" @tap="handleCheck">核账</button>
      </view>
      <view class="tips">
        <text style="color: #E6A23C;" v-if="checkStatus===-1">快来进行第一次核账吧~</text>
        <text style="color: #67C23A;" v-if="checkStatus===1">恭喜，您拥有一份完美的账单~</text>
        <view style="color: #E6A23C;" v-if="checkStatus===0">
          <text>您的账单目前还不完美，</text>
          <text style="text-decoration: underline;" @tap="handleSelectUncheck">点击查看待核账~</text>
          <view style="margin-top: 5px">
            <text>{{'上次核账时间: '+getLocalTime(checkTime)}}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import BaseCell from '../../components/BaseCell.vue'
import BaseCellItem from '../../components/BaseCellItem.vue'
import * as account from '../../apis/account.js'
import { updateCheckTime } from '@/apis/user'
import { isExistUncheck } from '@/apis/detail'
import { initAccount } from '@/utils/apis'

export default {
  data () {
    return {
      // 账户数据
      list: [],
      // 资产
      all_balance: 0,
      // 余额
      all_surplus: 0,
      // 负债
      all_liabilities: 0,
      // 核账状态：-1：首次核账，0：待核账，1：已核账
      checkStatus: -2
    }
  },
  computed: {
    checkTime () {
      return this.$store.state.userInfo.checkTime
    }
  },
  components: {
    BaseCell,
    BaseCellItem
  },
  onShow () {
    this.initAccountList()
    this.initCheckStatus()
    this.isExistUncheck()
  },
  methods: {
    // 前往未核账单搜索页
    async handleSelectUncheck () {
      const params = {
        check_time: this.checkTime
      }
      uni.navigateTo({
        url: '/pages/search/search?params=' + encodeURIComponent(JSON.stringify(params))
      })
    },
    // 是否存在未核账单
    async isExistUncheck () {
      this.checkStatus = await isExistUncheck(this.checkTime)
    },
    // 本地时间工具类
    getLocalTime (nS) {
      return new Date(parseInt(nS) * 1000).toLocaleString('chinese', {
        hour12: false
      }).replace(/年|月/g, '-').replace(/日/g, ' ')
    },
    // 初始化核账状态
    initCheckStatus () {
      if (this.checkTime === 0) {
        this.checkStatus = -1
      }
    },
    // 获取账户数据
    async initAccountList () {
      this.list = await account.manageList()
      this.all_balance = 0
      this.all_liabilities = 0
      this.all_surplus = 0
      this.list.forEach(item => {
        if (item.add_total) {
          if (item.balance >= 0) {
            this.all_balance += item.balance
          } else {
            this.all_liabilities += item.balance
          }
        }
      })
      this.all_surplus = this.all_balance + this.all_liabilities
      this.all_balance = parseFloat(this.all_balance.toFixed(2))
      this.all_surplus = parseFloat(this.all_surplus.toFixed(2))
      this.all_liabilities = parseFloat(this.all_liabilities.toFixed(2))
    },
    // 前往添加账户页面
    handleAdd () {
      uni.navigateTo({
        url: '/pages/account/add'
      })
    },
    // 编辑账户
    handleEdit (item) {
      uni.showActionSheet({
        itemList: ['查看明细', '编辑账户', '删除账户'],
        success: (e) => {
          switch (e.tapIndex) {
            case 0:
              uni.navigateTo({
                url: '/pages/search/search?params=' + encodeURIComponent(JSON.stringify({
                  account_id: item.id
                }))
              })
              break
            case 1:
              uni.navigateTo({
                url: '/pages/account/add?item=' + encodeURIComponent(JSON.stringify(item))
              })
              break
            case 2:
              account.getAccountDetailCount(item.id).then(res => {
                uni.showModal({
                  title: '提示',
                  content: `该操作将删除账户关联的 ${res} 条账单明细 , 请慎重操作！`,
                  success: async (res) => {
                    if (res.confirm) {
                      await account.del(item.id)
                      this.$util.toastSuccess('删除成功')
                      await this.initAccountList()
                      await initAccount(true)
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
    },
    // 核账操作
    handleCheck () {
      uni.showModal({
        title: '提示',
        content: '请确保账户余额和您实际余额一致，再进行核账操作！',
        success: async res => {
          if (res.confirm) {
            const data = {
              all_balance: this.all_balance,
              all_liabilities: this.all_liabilities,
              all_surplus: this.all_surplus,
              list: this.list
            }
            this.$store.state.userInfo.checkTime = await updateCheckTime({
              data: JSON.stringify(data)
            })
            this.checkStatus = 1
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.body {
  display: flex;
  align-items: center;
  flex-direction: column;
  .head{
    display: flex;
    flex-direction: column;
    background-color: #f8f8f8;
    height: 10vh;
    justify-content: space-around;
    font-size: 28px;
    font-weight: bold;
    width: 100%;
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
  .cell-wrap {
    height: 60vh;
  }
  .bottom{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 30vh;
    overflow: hidden;
    .tips{
      font-size: 24px;
      text-align: center;
    }
  }

}
</style>
