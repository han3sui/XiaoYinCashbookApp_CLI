<template>
  <view class="claim">
    <base-subsection class="subsection" :list="subList" :current="subCurrent" @change="handleSubChange"/>
    <scroll-view scroll-y class="content">
      <template v-if="claimList[subCurrent+1].length">
        <view class="claim-total-money">总计：{{ claimTotal[subCurrent + 1] }}</view>
        <checkbox-group @change="checkboxChange" class="checkbox-group">
          <view class="claim-item" v-for="(item,index) in claimList[subCurrent+1]" :key="index">
            <view class="claim-item-meta" v-if="(index===0) || (item.time!==claimList[subCurrent+1][index-1].time)">
              <text class="claim-item-meta-date">{{ item.time }} {{ $util.getWeekDay(item.time) }}</text>
            </view>
            <view class="claim-item-content" hover-class="hover"
                  :class="[index<claimList[subCurrent+1].length && item.time!==claimList[subCurrent+1][index+1].time?'hide-after':'']"
                  @tap="handleEdit(index)">
              <view class="left">
                <checkbox style="transform:scale(0.8)" color="#007aff" :value="item.id" :checked="checked.includes(item.id)" />
                <base-icon class="left-icon" :name="item.category.icon|getIconUrl" :title="item.category.name"/>
                <view class="left-info">
                  <text class="left-info-title">{{ item.category.name }}</text>
                  <text class="left-info-remark" v-if="item.remark">{{ item.remark }}</text>
                  <text class="left-info-account">{{ item.account.name }}</text>
                </view>
              </view>
              <view class="right">
                <text class="right-money">{{ $util.formatMoney(item.money) }}</text>
              </view>
            </view>
          </view>
        </checkbox-group>
        <view class="claim-footer safe-area-inset-bottom">
          <view class="left">
              <checkbox-group @change="handleCheckAll">
                <label class="left-text">
                  <checkbox value="1" style="transform:scale(0.8)" color="#007aff" />全选
                </label>
              </checkbox-group>
          </view>
          <view class="right">
            <view class="claim-button" @tap="handleClaim">
              <text class="claim-button-text">去报销({{checked.length}})</text>
            </view>
          </view>
        </view>
      </template>
      <base-empty v-else/>
    </scroll-view>
    <base-popup position="bottom" :safe-area-inset-bottom="true" v-model="pickerVisible">
      <scroll-view scroll-y class="account-scroll">
        <view class="account-scroll-title">选择报销入账账户</view>
        <view class="account-scroll-content">
          <view class="account-list-item" v-for="(item,index) in accountList" :key="index" @tap="handleSelectAccount(item)">
            <base-icon size="50" :name="item.icon" :label="item.name"/>
<!--            <text>{{item.name}}</text>-->
          </view>
        </view>
      </scroll-view>
    </base-popup>
  </view>
</template>

<script>
import { getClaim } from '../../apis/detail'
import BaseSubsection from '../../components/BaseSubsection'
import BaseIcon from '../../components/BaseIcon'
import * as detail from '../../apis/detail'
import BaseEmpty from '../../components/BaseEmpty'
import BasePopup from '../../components/BasePopup'

export default {
  name: 'claim',
  components: {
    BasePopup,
    BaseEmpty,
    BaseIcon,
    BaseSubsection
  },
  data () {
    return {
      // tab列表
      subList: ['未报销', '已报销'],
      // 当前选择tab
      subCurrent: 0,
      // 报销列表
      claimList: {
        1: [],
        2: []
      },
      // 报销总计
      claimTotal: {
        1: 0,
        2: 0
      },
      // 账户列表显示
      pickerVisible: false,
      // 当前报销明细ID,
      activeDetailId: 0,
      // 批量选择数组
      checked: []
    }
  },
  computed: {
    accountList () {
      return [{ id: 0, name: '保持原账户', icon: 'icon-define' }, ...this.$store.state.account]
    }
  },
  onShow () {
    this.initClaim()
  },
  methods: {
    handleClaim () {
      if (!this.checked.length) {
        this.$util.toastError('请选择报销明细')
      } else {
        this.pickerVisible = true
        // uni.showModal({
        //   title: '提示',
        //   content: '如果保持原账户入账，请直接确认，否则请选择入账账户',
        //   cancelText: '选择账户',
        //   cancelColor: '#ff9900',
        //   success: async (res) => {
        //     if (res.confirm) {
        //       await detail.update(item.id, {
        //         claim: 2,
        //         income_account_id: item.account.id
        //       })
        //       this.$util.toastSuccess('报销成功')
        //       await this.initClaim()
        //     } else {
        //       this.activeDetailId = item.id
        //       this.pickerVisible = true
        //     }
        //   }
        // })
      }
    },
    // checkbox变更
    checkboxChange (e) {
      this.checked = e.target.value
    },
    // 选择全部
    handleCheckAll (e) {
      console.log(e)
      if (e.target.value.length) {
        this.checked = this.claimList[1].map(item => item.id)
      } else {
        this.checked = []
      }
    },
    // 标记需要报销的明细
    handleCheckbox (e) {
      if (e.target.value.length) {
        this.data.add_total = 1
      } else {
        this.data.add_total = 0
      }
    },
    // 拉取报销账单
    async initClaim () {
      this.claimList[1] = await getClaim(1)
      this.claimList[2] = await getClaim(2)
      if (this.claimList[1].length) {
        this.claimTotal[1] = 0
        this.claimList[1].forEach(item => {
          this.claimTotal[1] += item.money
        })
      }
      if (this.claimList[2].length) {
        this.claimTotal[2] = 0
        this.claimList[2].forEach(item => {
          this.claimTotal[2] += item.money
        })
      }
      this.claimTotal[1] = parseFloat(this.claimTotal[1].toFixed(2))
      this.claimTotal[2] = parseFloat(this.claimTotal[2].toFixed(2))
    },
    // 切换sub选项卡
    handleSubChange (index) {
      this.subCurrent = index
    },
    // FIXME:直接传item，会报错undefined，待继续研究
    // 编辑账单
    handleEdit (index) {
      const item = this.claimList[this.subCurrent + 1][index]
      if (item.claim !== 2) {
        uni.showActionSheet({
          itemList: ['编辑明细', '删除明细'],
          success: (e) => {
            switch (e.tapIndex) {
              case 0:
                uni.navigateTo({
                  url: '/pages/index/edit?item=' + encodeURIComponent(JSON.stringify(item))
                })
                break
              case 1:
                uni.showModal({
                  title: '提示',
                  content: '请确认是否要删除该条明细',
                  success: async (res) => {
                    if (res.confirm) {
                      await detail.del(item.id)
                      this.$util.toastSuccess('删除成功')
                      await this.initClaim()
                    }
                  }
                })
                break
              default:
                this.$util.toastError('无效的选项')
            }
          }
        })
      } else {
        uni.showActionSheet({
          itemList: ['删除明细'],
          success: (e) => {
            switch (e.tapIndex) {
              case 0:
                uni.showModal({
                  title: '提示',
                  content: '请确认是否要删除该条明细',
                  success: async (res) => {
                    if (res.confirm) {
                      await detail.del(item.id)
                      this.$util.toastSuccess('删除成功')
                      await this.initClaim()
                    }
                  }
                })
                break
              default:
                this.$util.toastError('无效的选项')
            }
          }
        })
      }
    },
    // 选择入账账户
    async handleSelectAccount (item) {
      await detail.update(this.activeDetailId, {
        claim: 2,
        income_account_id: item.id
      })
      this.activeDetailId = 0
      this.pickerVisible = false
      this.$util.toastSuccess('报销成功')
      await this.initClaim()
    }
  }
}
</script>

<style scoped lang="scss">
.hide-after {
  &:after {
    display: none;
  }
}

.account-scroll{
  //height: 35vh;
  background-color: #f8f8f8;
  &-title{
    font-size: 26px;
    font-weight: bold;
    margin: 30px 0 30px 20px;
  }
  &-content{
    display: flex;
    flex-direction: column;
    padding: 20px;
    background: #FFF;
    .account-list-item{
      padding: 10px;
      display: flex;
      font-size: 24px;
      //display: flex;
      //align-items: center;
      //justify-content: space-around;
      //width: calc(calc(100% / 4) - 20px);
      //margin: 10px;
      //height: 80px;
      //border-radius: 10px;
      //background: #FFF;
      //font-size: 28px;
      &:active{
        background-color: #EEEEEE;
      }
    }
  }
  //&-content{
  //  display: flex;
  //  flex-direction: row;
  //  flex-wrap: wrap;
  //  padding: 20px;
  //  .account-list-item{
  //    display: flex;
  //    align-items: center;
  //    justify-content: space-around;
  //    width: calc(calc(100% / 4) - 20px);
  //    margin: 10px;
  //    height: 80px;
  //    border-radius: 10px;
  //    background: #FFF;
  //    font-size: 28px;
  //    &:active{
  //      background-color: #EEEEEE;
  //    }
  //  }
  //}
}

.claim {
  .subsection {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 10vh;
  }

  .account-picker {
    height: 20vh;
  }

  .content {
    display: flex;
    flex-direction: column;
    height: 90vh;

    .claim-total-money {
      color: #ff9900;
      font-size: 28px;
      font-weight: bold;
      padding: 24px 40px;
      background-color: #f6f6f6;
      position: relative;

      &:before {
        content: "";
        position: absolute;
        border-left: 8px solid #2979ff;
        height: 100%;
        top: 0;
        left: 0;
      }
    }
    .checkbox-group{
      margin-bottom: 100px;
    }

    .claim-item {
      display: flex;
      flex-direction: column;

      .claim-item-meta {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 24px 40px;
        position: relative;
        font-size: 24px;
        font-weight: bold;

        &:after {
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

      .claim-item-content {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 24px 40px;
        position: relative;

        &:after {
          position: absolute;
          bottom: 0;
          right: 30px;
          left: 30px;
          height: 1px;
          content: "";
          -webkit-transform: scaleY(.5);
          transform: scaleY(.5);
          background-color: #e5e5e5
        }

        .left {
          display: flex;
          flex-direction: row;
          align-items: center;

          .left-icon {
            width: 50px;
            height: 50px;
            margin-right: 18px;
          }

          .left-info {
            display: flex;
            flex-direction: column;
            align-content: flex-start;

            &-title {
              font-size: 28px;
              color: #3b4144;
            }

            &-remark {
              font-size: 24px;
              color: #999;
              padding-top: 10px;
            }

            &-account {
              font-size: 24px;
              color: #999;
              padding-top: 10px;
            }
          }
        }

        .right {
          &-money {
            font-family: Avenir, Helvetica, Arial, sans-serif;
            font-weight: 600;
            font-size: 28px;
            color: #3b4144;
          }
        }
      }
    }
    .claim-footer{
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100vw;
      background-color: #f6f6f6;
      height: 100px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .left{
        display: flex;
        flex-direction: row;
        justify-content: center;
        margin-left: 20px;
        &-text{
          display: flex;
          align-items: center;
          font-size: 24px;
        }
      }
      .claim-button{
        height: 70px;
        margin-right: 20px;
        border-radius: 40px;
        width: 200px;
        background: linear-gradient(-90deg, rgba(38, 196, 65, 1), rgba(1, 174, 50, 1));
        font-size: 24px;
        font-weight: bold;
        color: #FFFFFF;
        line-height: 70px;
        text-align: center;
      }
    }
  }
}
</style>
