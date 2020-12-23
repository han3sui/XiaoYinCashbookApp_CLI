<template>
  <view class="search">
    <view class="search-head">
      <view class="search-head-wrap">
        <base-icon class="search-icon" name="search" color="#808080"/>
        <input class="search-input" :focus="focusStatus" @focus="inputStatus='focus'" @blur="inputStatus='blur'" @confirm="handleSearch" confirm-type="search" v-model="remark" maxlength="10" placeholder="搜索备注" placeholder-style="font-size:28rpx"/>
        <base-icon v-show="clearStatus" class="search-icon" name="close" color="#808080" @tap="clearSearch"/>
      </view>
    </view>
    <scroll-view scroll-y class="search-main" @scrolltolower="loadmore=true">
      <list-details :loadmore.sync="loadmore" :params="params"/>
    </scroll-view>
  </view>
</template>

<script>
import ListDetails from '../../components/ListDetails'
import BaseIcon from '../../components/BaseIcon'
export default {
  name: 'search',
  components: { BaseIcon, ListDetails },
  data () {
    return {
      // 查询参数
      params: {
        year: 0,
        month: 0,
        account_id: 0,
        category_id: 0,
        remark: '',
        check_time: 0
      },
      // 加载更多
      loadmore: false,
      // 备注
      remark: '',
      // input清空icon显示状态
      clearStatus: false,
      // input是否需要主动激活
      focusStatus: false,
      // input焦点状态
      inputStatus: ''
    }
  },
  watch: {
    remark (e) {
      if (this.inputStatus === 'focus' && e !== '') {
        // 如果当前input是焦点状态，并且备注内容不为空，则显示清空icon
        setTimeout(() => {
          this.clearStatus = true
        }, 100)
      }
    }
  },
  onLoad (e) {
    if (e.params) {
      // 如果存在搜索条件，说明是从图标或者其他路径进入，将搜索条件直接赋值到当前data
      const obj = JSON.parse(decodeURIComponent(e.params))
      Object.keys(obj).forEach(key => {
        this.params[key] = obj[key]
      })
    } else {
      // 如果不存在搜索条件，说明是从主页搜索框进入，则直接激活当前input
      this.focusStatus = true
    }
  },
  methods: {
    // 清空搜索input框
    clearSearch () {
      this.remark = ''
      this.params.remark = ''
      setTimeout(() => {
        this.clearStatus = false
      }, 100)
    },
    // 根据搜索框内容，执行搜索
    handleSearch () {
      if (this.remark === '') {
        this.$util.toastError('请输入搜索内容')
      } else {
        this.params.remark = this.remark
      }
    }
  }
}
</script>

<style scoped lang="scss">
.search{
  display: flex;
  flex-direction: column;
  &-head{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 10vh;
    &-wrap{
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 80%;
      height: 5vh;
      background-color: #f2f2f2;
      border-radius: 10px;
      .search-icon{
        padding: 0 10px;
      }
      .search-input{
        flex: 1;
        font-size: 28px;
      }
    }
  }
  &-main{
    height: 90vh;
  }
}
</style>
