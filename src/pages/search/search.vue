<template>
  <view class="search">
    <view class="search-head">
      <view class="search-head-wrap">
        <base-icon class="search-icon" name="search" color="#808080"/>
        <input class="search-input" :focus="focusStatus" @focus="inputStatus='focus'" @blur="inputStatus='blur'" @confirm="handleSearch" confirm-type="search" v-model="remark" maxlength="10" placeholder="搜索备注" placeholder-style="font-size:28rpx"/>
        <base-icon v-show="clearStatus" class="search-icon" name="close" color="#808080" @tap="clearSearch"/>
      </view>
    </view>
    <scroll-view scroll-y class="search-main" @scrolltolower="listByParams()">
      <list-details/>
<!--      <base-empty v-if="JSON.stringify(data)==='{}' && loadStatus!=='loading' && loadStatus!=='error'"/>-->
<!--      <list-details v-else :list="data" @refresh="listByParams(true)">-->
<!--        <base-load-more :status="loadStatus" icon-type="flower"/>-->
<!--      </list-details>-->
    </scroll-view>
  </view>
</template>

<script>
import ListDetails from '../../components/ListDetails'
import * as detail from '../../apis/detail'
import BaseEmpty from '../../components/BaseEmpty'
import BaseIcon from '../../components/BaseIcon'
import BaseLoadMore from '@/components/BaseLoadMore'
export default {
  name: 'search',
  components: { BaseLoadMore, BaseIcon, BaseEmpty, ListDetails },
  data () {
    return {
      // 查询参数
      // params: {},
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
      loadStatus: '',
      // 明细数据
      data: {},
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
      // this.params = Object.assign({}, this.params, JSON.parse(decodeURIComponent(e.params)))
      // this.$set(this.params, 'page_no', 0)
      // this.$set(this.params, 'page_size', 20)
      const obj = JSON.parse(decodeURIComponent(e.params))
      Object.keys(obj).forEach(key => {
        this.params[key] = obj[key]
      })
    } else {
      // 如果不存在搜索条件，说明是从主页搜索框进入，则直接激活当前input
      this.focusStatus = true
    }
  },
  onShow () {
    const defaultPrams = {
      year: 0,
      month: 0,
      account_id: 0,
      category_id: 0,
      remark: '',
      page_no: 0,
      page_size: 20
    }
    if (JSON.stringify(this.params) !== JSON.stringify(defaultPrams)) {
      // 如果带搜索条件进入的，直接根据条件进行请求
      this.listByParams()
    }
  },
  methods: {
    // 根据查询条件请求
    listByParams (refresh = false) {
      this.params.page_no = this.params.page_no + 1
      if (refresh) {
        this.params.page_no = 1
        this.data = {}
      } else if (this.loadStatus === 'loading' || this.loadStatus === 'error' || this.loadStatus === 'finished') {
        return
      }
      this.loadStatus = 'loading'
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
        // this.$set(this.params, 'remark', this.remark)
        this.params.remark = this.remark
        this.listByParams(true)
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
