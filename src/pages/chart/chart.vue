<template>
    <view class="chart">
        <view class="chart-head">
            <view class="chart-head-title">
                <view>
                    <view class="chart-mode">
                        <view :class="[timeMode === 'year' ? 'chart-mode-bg' : '']" @tap="handleChangeTimeMode('year')"
                            >年</view
                        >
                        <view
                            :class="[timeMode === 'month' ? 'chart-mode-bg' : '']"
                            @tap="handleChangeTimeMode('month')"
                            >月</view
                        >
                        <view :class="[directionMode === 1 ? 'chart-mode-bg' : '']" @tap="handleChangeDirectionMode(1)"
                            >收</view
                        >
                        <view :class="[directionMode === 2 ? 'chart-mode-bg' : '']" @tap="handleChangeDirectionMode(2)"
                            >支</view
                        >
                    </view>
                </view>
                <view>支出</view>
                <view>收入</view>
            </view>
            <view class="chart-head-main">
                <view class="head-time">
                    <picker
                        class="head-time-picker"
                        mode="date"
                        :value="date"
                        :start="dateStart"
                        :end="dateEnd"
                        :fields="timeMode"
                        @change="handleChangeDate"
                    >
                        <text v-if="timeMode === 'year'">{{ date.split("-")[0] }}年</text>
                        <text v-if="timeMode === 'month'">{{ date.split("-")[0] }}年{{ date.split("-")[1] }}月</text>
                    </picker>
                </view>
                <view class="total-out">{{ $util.formatMoney(data.total_out) || 0 }}</view>
                <view class="total-in">{{ $util.formatMoney(data.total_income) || 0 }}</view>
            </view>
        </view>
        <scroll-view scroll-y class="chart-main">
            <view v-if="data[directionMap[directionMode]]" class="chart-wrap">
                <view v-for="(item, index) in data[directionMap[directionMode]]" :key="index" class="chart-item">
                    <view @tap="handleExpand(item.id)">
                        <view class="chart-item-head">
                            <view class="chart-item-head-title"
                                >{{ item.name }}：{{ $util.formatMoney(item.money) }}</view
                            >
                            <base-icon
                                class="arrow-down"
                                :class="{ 'arrow-down-active': item.id === activeId }"
                                name="arrow-down"
                                size="50"
                                color="#969799"
                            />
                        </view>
                        <progress :percent="item.percent" show-info stroke-width="3" font-size="14" />
                    </view>
                    <view
                        class="chart-item-nodes-wrap"
                        :style="[{ height: item.id === activeId ? nodeHeight['node-id-' + item.id] + 'px' : '0' }]"
                    >
                        <view :id="`node-id-${item.id}`">
                            <template v-for="(item1, index1) in item.nodes">
                                <view
                                    :key="index1"
                                    class="chart-item-nodes"
                                    hover-class="hover"
                                    @tap="handleSearch(item1.id)"
                                >
                                    <view class="chart-item-head">
                                        <view class="chart-item-head-title"
                                            >{{ item1.name }}：{{ $util.formatMoney(item1.money) }}</view
                                        >
                                    </view>
                                    <progress
                                        :percent="item1.percent"
                                        activeColor="red"
                                        show-info
                                        stroke-width="2"
                                        font-size="12"
                                    />
                                </view>
                            </template>
                        </view>
                    </view>
                </view>
            </view>
            <base-empty v-else />
        </scroll-view>
    </view>
</template>

<script>
import { chart } from "../../apis/detail";
import BaseIcon from "../../components/BaseIcon";
import BaseEmpty from "../../components/BaseEmpty";

export default {
    name: "Chart",
    components: { BaseEmpty, BaseIcon },
    data() {
        return {
            // 手风琴模式，当前展开的主分类ID
            activeId: 0,
            // 总支出、收入、详细数据
            data: {},
            // 时间picker显示时间
            date: this.$util.getDate(),
            // 日期模式，year/month
            timeMode: "month",
            // 收/支显示
            directionMode: 2,
            // 收支对应map，由于账单里的direction是1、2，分类数据使用的是income、out
            directionMap: {
                1: "income",
                2: "out"
            },
            // 查询参数
            params: {
                year: 0,
                month: 0
            },
            // 主分类下的子分类的内容高度，用于手风琴效果
            nodeHeight: {}
        };
    },
    computed: {
        // 时间picker开始时间
        dateStart() {
            return this.$util.getDate("start");
        },
        // 时间picker结束时间
        dateEnd() {
            return this.$util.getDate("end");
        }
    },
    onShow() {
        this.getChart();
    },
    watch: {
        // 如果数据更新了，重新设置子分类内容高度
        data() {
            this.initNodeHeight();
        },
        // 如果收支模式更新了，重新设置子分类内容高度
        directionMode() {
            this.initNodeHeight();
        }
    },
    methods: {
        // 初始化子分类内容高度
        initNodeHeight() {
            this.$nextTick(() => {
                this.data[this.directionMap[this.directionMode]].forEach((item) => {
                    uni.createSelectorQuery()
                        .select("#node-id-" + item.id)
                        .boundingClientRect((result) => {
                            if (result) {
                                this.$set(this.nodeHeight, `node-id-${item.id}`, result.height);
                            }
                        })
                        .exec();
                });
            });
        },
        // 请求图表数据
        async getChart() {
            this.params.year = this.date.split("-")[0];
            if (this.timeMode === "year") {
                this.params.month = 0;
            } else {
                this.params.month = this.date.split("-")[1] || 0;
            }
            const res = await chart(this.params);
            this.data = Object.assign({}, this.data, res);
        },
        // 更改时间picker
        handleChangeDate(e) {
            this.date = e.target.value;
            this.getChart();
        },
        // 更改时间模式
        handleChangeTimeMode(e) {
            this.timeMode = e;
            if (this.timeMode === "month" && !this.date.split("-")[1]) {
                this.date = `${this.date}-01`;
            }
            this.getChart();
        },
        // 更改收支模式
        handleChangeDirectionMode(e) {
            this.directionMode = e;
        },
        // 展开主分类
        handleExpand(id) {
            if (this.activeId === id) {
                this.activeId = 0;
            } else {
                this.activeId = id;
            }
        },
        // 查看子分类详细账单
        handleSearch(id) {
            const params = {
                category_id: id,
                direction: this.directionMode,
                year: this.params.year,
                month: this.params.month
            };
            uni.navigateTo({
                url: "/pages/search/search?params=" + encodeURIComponent(JSON.stringify(params))
            });
        }
    }
};
</script>

<style scoped lang="scss">
.chart {
    &-head {
        display: flex;
        flex-direction: column;
        height: 10vh;
        background-color: #f8f8f8;
        justify-content: space-around;
        font-size: 28px;
        font-weight: bold;
        &-title {
            display: flex;
            flex-direction: row;
            & view {
                width: 33.33%;
                text-align: center;
                display: flex;
                justify-content: center;
                .chart-mode {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                    width: 70%;
                    border: 1px solid #333333;
                    &-bg {
                        background-color: #333333;
                        color: #ffffff !important;
                    }
                }
            }
        }
        &-main {
            display: flex;
            flex-direction: row;
            & view {
                width: 33.33%;
                text-align: center;
            }
            .head-time-picker {
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
        }
    }
    &-main {
        height: 90vh;
        .chart-wrap {
            padding: 20px;
            .chart-item {
                margin-bottom: 20px;
                &-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    &-title {
                        font-size: 28px;
                    }
                    .arrow-down {
                        transition: all 0.3s;
                    }
                    .arrow-down-active {
                        transform: rotate(180deg);
                        transform-origin: center center;
                    }
                }
                .chart-item-nodes-wrap {
                    transition: all 0.3s;
                    overflow: hidden;
                    .chart-item-nodes {
                        padding: 20px;
                    }
                    .chart-item-head-title {
                        font-size: 26px !important;
                        color: #909399 !important;
                    }
                    & progress {
                        color: #909399 !important;
                    }
                }
            }
        }
    }
}
</style>
