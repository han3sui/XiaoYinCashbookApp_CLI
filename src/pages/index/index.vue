<template>
    <view class="body">
        <view class="head">
            <view class="head-item">
                <view class="left">
                    <picker
                        class="left-account"
                        mode="selector"
                        :value="accountIndex"
                        :range="accountList"
                        range-key="name"
                        @change="handleChangeAccount"
                    >
                        <text>{{ accountList[accountIndex].name }}</text>
                    </picker>
                    <view v-if="customDate" class="custom-date-value" @click="handleShowCale">{{
                        customDateValue
                    }}</view>
                    <picker
                        v-else
                        class="left-date"
                        mode="date"
                        :value="date"
                        :start="dateStart"
                        :end="dateEnd"
                        fields="month"
                        @change="handleChangeDate"
                    >
                        <text>{{ params.year }}年{{ params.month }}月</text>
                    </picker>
                    <view
                        class="custom-date"
                        :class="[customDate ? 'custom-date-active' : '']"
                        @click="handleClickCustomDate"
                        >自定义</view
                    >
                </view>
                <view hover-class="hover" class="right" @tap="handleToSearch">
                    <base-icon name="search" color="#666" size="40" label="搜索" />
                </view>
            </view>
            <view class="head-item">
                <view class="left">
                    <text class="left-out">支出: {{ $util.formatMoney(totalOut) }}</text>
                    <text class="left-income">收入: {{ $util.formatMoney(totalIncome) }}</text>
                </view>
            </view>
        </view>
        <list-details :params="params" path="index" @change="listMoney" @refresh="handleRefresh" />
        <tui-calendar
            ref="calendar"
            is-fixed
            active-bg-color="#007aff"
            btn-type="blue"
            :type="2"
            :min-date="dateStart"
            :max-date="dateEnd"
            @change="handleChangeCale"
        ></tui-calendar>
    </view>
</template>

<script>
import ListDetails from "../../components/ListDetails";
import BaseIcon from "../../components/BaseIcon";
import { listMoney } from "@/apis/detail";
import dayjs from "dayjs";

export default {
    components: { BaseIcon, ListDetails },
    data() {
        return {
            //自定义日期
            customDate: false,
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
                remark: "",
                check_time: 0,
                start_date: "",
                end_date: ""
            }
        };
    },
    computed: {
        // 开始时间
        dateStart() {
            return this.$util.getDate("start");
        },
        // 结束时间
        dateEnd() {
            return this.$util.getDate("end");
        },
        // 组装账户列表
        accountList() {
            let list = [];
            list = JSON.parse(JSON.stringify(this.$store.state.account));
            list.unshift({
                id: 0,
                name: "全部账户"
            });
            return list;
        },
        customDateValue() {
            if (!this.params.start_date || !this.params.end_date) {
                return "请选择";
            }
            return `${dayjs(this.params.start_date).format("MM/DD")}-${dayjs(this.params.end_date).format("MM/DD")}`;
        }
    },
    onShow() {
        this.params.year = this.date.split("-")[0];
        this.params.month = this.date.split("-")[1];
        this.listMoney();
    },
    onUnload() {
        uni.$off("indexChangeDetail");
    },
    methods: {
        handleClickCustomDate() {
            this.customDate = !this.customDate;
            if (!this.customDate) {
                this.params.start_date = "";
                this.params.end_date = "";
            }
            this.listMoney();
        },
        handleShowCale() {
            this.$refs.calendar.show();
        },
        // 明细列表触发刷新，需要重新拉取当月支出、收入总和
        handleRefresh() {
            this.listMoney();
        },
        // 获取当月支出、收入总和
        listMoney() {
            listMoney(this.params).then((res) => {
                const incomeObj = res.filter((item) => item.direction === 1)[0];
                const outObj = res.filter((item) => item.direction === 2)[0];
                if (incomeObj) {
                    this.totalIncome = incomeObj.total;
                } else {
                    this.totalIncome = 0;
                }
                if (outObj) {
                    this.totalOut = outObj.total;
                } else {
                    this.totalOut = 0;
                }
            });
        },
        handleChangeCale(e) {
            const { startDate, endDate } = e;
            this.params.start_date = startDate;
            this.params.end_date = endDate;
            this.listMoney();
        },
        // 更改时间picker
        handleChangeDate(e) {
            this.date = e.target.value;
            this.params.year = this.date.split("-")[0];
            this.params.month = this.date.split("-")[1];
            this.params.start_date = "";
            this.params.end_date = "";
            this.listMoney();
        },
        // 更改显示账户
        handleChangeAccount(e) {
            this.accountIndex = e.target.value;
            this.params.account_id = this.accountList[this.accountIndex].id;
            this.listMoney();
        },
        // 前往搜索页
        handleToSearch() {
            uni.navigateTo({
                url: "/pages/search/search"
            });
        }
    }
};
</script>

<style scoped lang="scss">
.body {
    .head {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        height: 10vh;
        padding: 0 20px;
        box-shadow: 0 2px 16px 0 #c0c0c0;
        &-item {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            .left {
                display: flex;
                flex-direction: row;
                &-account {
                    font-size: 28px;
                    & text {
                        position: relative;
                        &:after {
                            display: block;
                            content: "";
                            border-width: 15px 10px;
                            border-style: solid;
                            border-color: #333 transparent transparent transparent;
                            position: absolute;
                            top: 12px;
                            right: -30px;
                        }
                    }
                }
                &-date {
                    margin-left: 50px;
                    font-size: 28px;
                    & text {
                        position: relative;
                        &:after {
                            display: block;
                            content: "";
                            border-width: 15px 10px;
                            border-style: solid;
                            border-color: #333 transparent transparent transparent;
                            position: absolute;
                            top: 12px;
                            right: -30px;
                        }
                    }
                }
                &-out {
                    font-size: 28px;
                    color: #666;
                }
                &-income {
                    margin-left: 20px;
                    font-size: 28px;
                    color: #666;
                }
                .custom-date-value {
                    display: flex;
                    align-items: flex-end;
                    margin-left: 50px;
                    font-size: 28px;
                }
                .custom-date {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 50px;
                    background-color: #ededed;
                    color: #999;
                    height: 38rpx;
                    padding: 0 20rpx;
                    font-size: 24rpx;
                    border-radius: 30rpx;
                }
                .custom-date-active {
                    background-color: #5677fc;
                    color: #fff;
                }
            }
        }
    }
}
</style>
