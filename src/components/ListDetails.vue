<template>
  <view class="body">
    <view class="detail-wrap" v-for="(item,index) in list" :key="index">
      <view class="detail-meta">
        <text class="detail-meta-date">{{ item.time }} {{ $util.getWeekDay(item.time) }}</text>
        <view>
          <text class="detail-meta-money">{{ item.out > 0 ? '支出 : ' + $util.formatMoney(item.out) : '' }}</text>
          <text class="detail-meta-money" style="margin-left: 5px">{{ item.income > 0 ? '收入 : ' + $util.formatMoney(item.income) : '' }}</text>
        </view>
      </view>
      <view class="detail-content">
        <view :style="{'textDecoration':v.claim===2?'line-through':''}" class="detail-item" hover-class="hover" v-for="(v,i) in item.list" :key="i" @tap="handleEdit(v)">
          <view class="detail-item-info">
            <base-icon class="detail-item-info-thumb" :name="(v.direction===3?v.account.icon:v.category.icon)|getIconUrl" :title="v.direction===3?v.account.name:v.category.name"/>
            <view class="detail-item-info-wrap">
              <text v-if="v.claim===0" class="detail-item-info-wrap-name">{{v.direction===3?'内部转账':v.category.name}}</text>
              <text v-else class="detail-item-info-wrap-name">{{`报销 · ${v.category.name}`}}</text>
              <text class="detail-item-info-wrap-remark" v-if="v.remark">{{v.remark}}</text>
              <text class="detail-item-info-wrap-other" :class="[checkTime>v.update_time?'':'detail-item-info-wrap-other__nocheck']">{{(checkTime>v.update_time?'已核账':'待核账')+' · '+v.account.name+(v.income_account.name?('->'+v.income_account.name):'')}}</text>
            </view>
          </view>
          <view class="detail-item-money" :class="[v.direction===1?'detail-item-money__income':v.direction===2?'detail-item-money__out':'detail-item-money__other']">{{v.direction===2?'-':''}}{{$util.formatMoney(v.money)}}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import BaseIcon from './BaseIcon'
import * as detail from '../apis/detail'
export default {
  name: 'ListDetails',
  components: { BaseIcon },
  props: {
    // 明细数组
    list: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  computed: {
    // 最后核账时间
    checkTime () {
      return this.$store.state.userInfo.checkTime
    }
  },
  methods: {
    // 触发编辑
    handleEdit (item) {
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
                    this.$emit('refresh', true)
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
  }
}
</script>

<style scoped lang="scss">
.body{
  .detail-wrap{
    .detail-meta{
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      padding: 24px 30px;
      color: #000000;
      font-size: 24px;
      font-weight: bold;
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
    .detail-content{
      display: flex;
      flex-direction: column;
      .detail-item{
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 30px;
        position: relative;
        &:not(:last-child):after{
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
        &-info{
          display: flex;
          flex-direction: row;
          align-items: center;
          &-thumb{
            width: 50px;
            height: 50px;
            margin-right: 18px;
          }
          &-wrap{
            display: flex;
            flex-direction: column;
            text-align: left;
            &-name{
              font-size: 28px;
              color: #3b4144;
              overflow: hidden;
            }
            &-remark{
              margin-top: 6px;
              color: #999;
              font-size: 24px;
              overflow: hidden;
            }
            &-other{
              margin-top: 6px;
              color: #999;
              font-size: 24px;
              overflow: hidden;
              &__nocheck{
                color: #f0ad4e;
              }
            }
          }
        }
        &-money{
          font-family: Avenir, Helvetica, Arial, sans-serif;
          font-size: 30px;
          font-weight: 600;
          &__income{
            color: #4cd964;
          }
          &__out{
            color: #dd524d;
          }
          &__other{
            color: #f0ad4e;
          }
        }
      }
    }
  }
}
</style>
