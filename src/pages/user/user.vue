<template>
  <view>
    <view class="head">
      <template v-if="token">
        <template v-if="infoAuth===false">
          <view class="avatar">
            <img alt="" src="../../static/images/account.png"/>
          </view>
          <view class="info-wrap">
            <view class="auth-tips">
              <text>点击授权用户信息</text>
              <button class="auth-button" open-type="getUserInfo" @getuserinfo="login"></button>
            </view>
            <view class="tips">
              <text>已记账{{allDays}}天</text>
            </view>
          </view>
        </template>
        <template v-else>
          <view class="avatar">
            <img alt="" :src="userInfo.avatarUrl"/>
          </view>
          <view class="info-wrap">
            <view class="name">
              <text>{{ userInfo.nickName }}</text>
            </view>
            <view class="tips">
              <text>已记账{{allDays}}天</text>
            </view>
          </view>
        </template>
      </template>
      <template v-else>
        <view class="avatar">
          <img alt="" src="../../static/images/account.png"/>
        </view>
        <view class="login-tips">
          <text>游客，点击登录</text>
          <button class="login-button" open-type="getUserInfo" @getuserinfo="login"></button>
        </view>
      </template>
    </view>
    <view class="body">
      <view class="cell-wrap">
        <base-cell>
          <base-cell-item title='账户管理' :arrow="true" icon="account" @tap="toAccount"/>
          <base-cell-item title='报销管理' :arrow="true" icon="baoxiao" @tap="toClaim"/>
          <base-cell-item title='核账记录' :arrow="true" icon="hezhang" @tap="toCheckList"/>
          <base-cell-item title='支出类别管理' :arrow="true" icon="zhichu" @tap="toCategory('out')"/>
          <base-cell-item title='收入类别管理' :arrow="true" icon="shouru" @tap="toCategory('income')"/>
        </base-cell>
      </view>
      <view class="cell-wrap">
        <base-cell>
          <view class="feed-back-wrap">
            <base-cell-item title='反馈与建议' icon="fankui" :arrow="true"/>
            <button class="feed-back" open-type="feedback"/>
          </view>
          <base-cell-item title='清理缓存' icon="qingchuhuancun" note="程序异常时使用" @tap="clearStorage" :arrow="true"/>
          <view class="feed-back-wrap">
            <base-cell-item title='推荐给好友' icon="tuijian" :arrow="true"/>
            <button class="feed-back" open-type="share"/>
          </view>
        </base-cell>
      </view>
      <view class="cell-wrap">
        <base-cell>
          <base-cell-item title='当前版本' icon="banben" note="v1.1.2"/>
        </base-cell>
      </view>
    </view>
  </view>
</template>

<script>
import BaseCell from '../../components/BaseCell.vue'
import BaseCellItem from '../../components/BaseCellItem.vue'
import { getAllDays } from '@/apis/detail'
import { doLogin, getUserInfo } from '@/utils/apis'

export default {
  onShareAppMessage (res) {
    return {
      title: '小音邀请您一起来记账~',
      path: '/pages/index/index'
    }
  },
  components: {
    BaseCell,
    BaseCellItem
  },
  data () {
    return {
      allDays: 0,
      infoAuth: null
    }
  },
  computed: {
    token () {
      return this.$store.state.token
    },
    userInfo () {
      return this.$store.state.userInfo
    }
  },
  onLoad () {
    uni.getSetting({
      success: result => {
        this.infoAuth = result.authSetting['scope.userInfo'] === true
      },
      fail: e => {
        this.infoAuth = true
      }
    })
  },
  onShow () {
    this.initAllDays()
  },
  methods: {
    // 获取记账天数
    async initAllDays () {
      this.allDays = await getAllDays()
    },
    // 授权的同时登录
    login () {
      getUserInfo().then(doLogin)
      this.infoAuth = true
    },
    // 前往报销管理页面
    toClaim () {
      uni.navigateTo({
        url: '/pages/claim/claim'
      })
    },
    // 前往账户管理页面
    toAccount () {
      uni.navigateTo({
        url: '/pages/account/list'
      })
    },
    // 前往核账记录页面
    toCheckList () {
      uni.navigateTo({
        url: '/pages/check/check'
      })
    },
    // 清楚storage缓存和vuex缓存
    clearStorage () {
      uni.showModal({
        title: '提示',
        content: '程序异常时进行该操作，删除缓存后请重新登陆!',
        success: res => {
          if (res.confirm) {
            try {
              uni.clearStorageSync()
              this.$store.commit('CLEAR_VUEX')
            } catch (e) {
              this.$util.toastError(e)
            }
          }
        }
      })
    },
    // 前往分类管理页面
    async toCategory (e) {
      uni.navigateTo({
        url: `/pages/category/list?type=${e}`
      })
    }
  }
}
</script>

<style>
page {
  background: #F2F2F2;
}
</style>
<style scoped lang="scss">
.head {
  display: flex;
  flex-direction: row;
  height: 200px;
  align-items: center;
  background-color: #ffffff;
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    padding-left: 30px;
    padding-top: 20px;
    padding-bottom: 20px;
    & img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }

  .info-wrap {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 100px;
    padding-left: 20px;
    .name {
      font-size: 34px;
      font-weight: bold;
    }
    .tips {
      font-size: 24px;
      color: #999;
    }
    .auth-tips {
      font-size: 28px;
      color: #999;
      text-decoration: underline;
      position: relative;
      .auth-button {
        background: none;
        border: none;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        &:after {
          background: none;
          border: none;
        }
      }
    }
  }
  .login-tips {
    font-size: 28px;
    color: #999;
    padding-left: 20px;
    text-decoration: underline;
    position: relative;
    .login-button {
      background: none;
      border: none;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      &:after {
        background: none;
        border: none;
      }
    }
  }
}
.body {
  .cell-wrap {
    margin-top: 20px;
    .feed-back-wrap {
      position: relative;
      .feed-back {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: none;
        border: none;
        &:after {
          background: none;
          border: none;
        }
      }
    }
  }
}
</style>
