<template>
    <view class="check-content">
        <!--    空状态-->
        <template v-if="!list.length && loadStatus !== 'loading' && loadStatus !== 'error'">
            <base-empty />
        </template>
        <template v-else>
            <view v-for="(item, index) in list" :key="index" class="check-item">
                <view class="check-item-meta" @tap="handleExpand(item.id)">
                    <view class="check-item-meta-left">
                        <text class="check-item-meta-date">核账时间：{{ item.time | formatDate }}</text>
                        <view class="check-item-meta-money">
                            <text>资产：{{ item.all_balance }}</text>
                            <text>负债：{{ item.all_liabilities }}</text>
                            <text>余额：{{ item.all_surplus }}</text>
                        </view>
                    </view>
                    <view class="arrow-down" :class="{ 'arrow-down-active': item.id === activeId }">
                        <base-icon name="arrow-down" size="50" color="#969799" />
                    </view>
                </view>
                <view
                    class="check-item-wrap"
                    :style="[{ height: item.id === activeId ? nodeHeight['node-id-' + item.id] + 'px' : '0' }]"
                >
                    <view :id="`node-id-${item.id}`">
                        <view v-for="(v1, k1) in item.list" :key="k1" class="check-item-content">
                            <view class="left">
                                <base-icon
                                    :name="v1.icon"
                                    :title="v1.name"
                                    :label="v1.name"
                                    :label-margin-left="18"
                                    size="40"
                                />
                            </view>
                            <view class="right">
                                <text class="right-money">{{ v1.balance }}</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <base-load-more :status="loadStatus" @retry="retry" />
        </template>
    </view>
</template>

<script>
import { checkList } from "@/apis/user";
import BaseIcon from "../../components/BaseIcon";
import BaseEmpty from "../../components/BaseEmpty";
import BaseLoadMore from "@/components/BaseLoadMore";

export default {
    name: "Check",
    components: { BaseLoadMore, BaseEmpty, BaseIcon },
    data() {
        return {
            // 核账数据列表
            list: [],
            // 主分类下的子分类的内容高度，用于手风琴效果
            nodeHeight: {},
            // 手风琴模式，当前展开的主分类ID
            activeId: 0,
            // 加载状态，支持：loading/finished/error/loadmore
            loadStatus: "",
            // 分页条件
            paging: {
                // 当前页
                page_no: 0,
                // 分页条数
                page_size: 20
            }
        };
    },
    onShow() {
        this.initList();
    },
    onReachBottom() {
        this.initList();
    },
    methods: {
        // 出错之后，点击重新加载
        retry() {
            this.paging.page_no = this.paging.page_no - 1;
            this.loadStatus = "";
            this.initList();
        },
        // 初始化子分类内容高度
        initNodeHeight() {
            this.$nextTick(() => {
                this.list.forEach((item) => {
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
        // 获取核账记录
        initList() {
            if (this.loadStatus === "loading" || this.loadStatus === "error" || this.loadStatus === "finished") {
                return;
            }
            this.loadStatus = "loading";
            this.paging.page_no = this.paging.page_no + 1;
            checkList(this.paging)
                .then((res) => {
                    this.loadStatus = "";
                    if (res.length < this.paging.page_size) {
                        this.loadStatus = "finished";
                    }
                    res.forEach((item) => {
                        this.list.push({ ...JSON.parse(item.data), time: item.update_time, id: item.id });
                    });
                    this.initNodeHeight();
                })
                .catch(() => {
                    this.loadStatus = "error";
                });
        },
        // 展开主分类
        handleExpand(id) {
            if (this.activeId === id) {
                this.activeId = 0;
            } else {
                this.activeId = id;
            }
        }
    }
};
</script>

<style scoped lang="scss">
.check-content {
    display: flex;
    flex-direction: column;
    .check-item {
        display: flex;
        flex-direction: column;
        .check-item-meta {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 24px 40px;
            position: relative;
            &:after {
                position: absolute;
                bottom: 0;
                right: 0;
                left: 0;
                height: 1px;
                content: "";
                -webkit-transform: scaleY(0.5);
                transform: scaleY(0.5);
                background-color: #e5e5e5;
            }
            &-left {
                .check-item-meta-date {
                    font-size: 26px;
                    color: #808080;
                }
                .check-item-meta-money {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    padding-top: 10px;
                    font-size: 26px;
                    font-weight: 600;
                }
            }
            .arrow-down {
                height: 50px;
                transition: all 0.3s;
            }
            .arrow-down-active {
                transform: rotate(180deg);
                transform-origin: center center;
            }
        }
        .check-item-wrap {
            transition: all 0.3s;
            overflow: hidden;
        }
        .check-item-content {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 24px 40px;
            position: relative;
            &:not(:last-child):after {
                position: absolute;
                bottom: 0;
                right: 30px;
                left: 30px;
                height: 1px;
                content: "";
                -webkit-transform: scaleY(0.5);
                transform: scaleY(0.5);
                background-color: #e5e5e5;
            }
            .left {
                display: flex;
                flex-direction: row;
                align-items: center;
            }
            .right {
                &-money {
                    font-family: Avenir, Helvetica, Arial, sans-serif;
                    font-weight: bold;
                    font-size: 24px;
                    color: #3b4144;
                }
            }
        }
    }
}
</style>
