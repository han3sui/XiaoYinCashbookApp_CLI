<template>
    <base-pull-scroll
        class="list-detail-body"
        :refreshed="refreshed"
        :scroll-height="height"
        @refresh="handleRefresh"
        @loadmore="listByParams(false)"
    >
        <!--    空状态-->
        <template v-if="JSON.stringify(list) === '{}' && loadStatus !== 'loading' && loadStatus !== 'error'">
            <base-empty />
        </template>
        <!--    信息流主体-->
        <template v-else>
            <view v-for="(item, key) in list" :key="key" class="detail-wrap">
                <view class="detail-meta">
                    <text class="detail-meta-date">{{ item.time }} {{ $util.getWeekDay(item.time) }}</text>
                    <view>
                        <text v-if="item.out > 0" class="detail-meta-money"
                            >支出 : {{ $util.formatMoney(item.out) }}</text
                        >
                        <text v-if="item.income > 0" class="detail-meta-money" style="margin-left: 5px"
                            >收入 : {{ $util.formatMoney(item.income) }}
                        </text>
                    </view>
                </view>
                <view class="detail-content">
                    <view
                        v-for="(v, i) in item.list"
                        :key="i"
                        :style="{ textDecoration: v.claim === 2 ? 'line-through' : '' }"
                        class="detail-item"
                        hover-class="hover"
                        @tap="handleEdit(v, i)"
                    >
                        <view class="detail-item-info">
                            <base-icon
                                margin-right="18"
                                :name="v.direction === 3 ? v.account.icon : v.category.icon"
                                :title="v.direction === 3 ? v.account.name : v.category.name"
                            />
                            <view class="detail-item-info-wrap">
                                <text v-if="v.claim === 0" class="detail-item-info-wrap-name">
                                    {{ v.direction === 3 ? "内部转账" : v.category.name }}
                                </text>
                                <text v-else class="detail-item-info-wrap-name">{{ `报销 · ${v.category.name}` }}</text>
                                <text v-if="v.remark" class="detail-item-info-wrap-remark">{{ v.remark }}</text>
                                <text
                                    class="detail-item-info-wrap-other"
                                    :class="[checkTime > v.update_time ? '' : 'detail-item-info-wrap-other__nocheck']"
                                >
                                    {{
                                        (checkTime > v.update_time ? "已核账" : "待核账") +
                                        " · " +
                                        v.account.name +
                                        (v.income_account.name ? "->" + v.income_account.name : "")
                                    }}
                                </text>
                            </view>
                        </view>
                        <view
                            class="detail-item-money"
                            :class="[
                                v.direction === 1
                                    ? 'detail-item-money__income'
                                    : v.direction === 2
                                    ? 'detail-item-money__out'
                                    : 'detail-item-money__other'
                            ]"
                        >
                            {{ v.direction === 2 ? "-" : "" }}{{ $util.formatMoney(v.money) }}
                        </view>
                    </view>
                </view>
            </view>
            <!--    加载状态-->
            <base-load-more :status="loadStatus" icon-type="flower" @retry="retry" />
        </template>
    </base-pull-scroll>
</template>

<script>
import BaseIcon from "./BaseIcon";
import { search as detailSearch, del as detailDel } from "../apis/detail";
import BaseLoadMore from "@/components/BaseLoadMore";
import BaseEmpty from "@/components/BaseEmpty";
import BasePullScroll from "@/components/BasePullScroll";

export default {
    name: "ListDetails",
    components: { BasePullScroll, BaseEmpty, BaseLoadMore, BaseIcon },
    props: {
        // 搜索条件
        params: {
            type: Object,
            default: () => {
                return {};
            }
        },
        // 来源路径，index/search
        path: {
            type: String,
            default: ""
        },
        // scroll-view高度，单位vh
        height: {
            type: [String, Number],
            default: 90
        }
    },
    data() {
        return {
            // 是否刷新完毕
            refreshed: false,
            // 加载状态，支持：loading/finished/error/loadmore
            loadStatus: "",
            // 数据明细
            list: {},
            // 分页条件
            paging: {
                // 当前页
                page_no: 0,
                // 分页条数
                page_size: 20
            }
        };
    },
    computed: {
        // 最后核账时间
        checkTime() {
            return this.$store.state.userInfo.checkTime;
        },
        // 自定义的内联样式
        listDetailStyle() {
            return {
                height: `${this.height}vh`
            };
        }
    },
    watch: {
        params(newV, oldV) {
            // 因为get请求的时候，params加上了_t的唯一ID，防止在其他地方触发请求，使用到相同的params并且主要内容不变.
            // 但是_t更改后（该场景会在列表页删除一条明细后，回传给index页面，重新根据params请求当月金额明细的时候，被重现.
            // 此时params主体内容是不变的，但是_t唯一ID更新了，因此会造成重新刷新列表），会触发该watch，重新刷新列表数据.
            // 因此需要深拷贝新旧数据，去除_t参数后，进行比较，如果不一致，则刷新列表页
            const tmpNew = JSON.parse(JSON.stringify(newV));
            const tmpOld = JSON.parse(JSON.stringify(oldV));
            this.$delete(tmpNew, "_t");
            this.$delete(tmpOld, "_t");
            if (JSON.stringify(tmpNew) !== JSON.stringify(tmpOld)) {
                this.listByParams(true);
            }
        }
    },
    created() {
        if (this.path === "index") {
            uni.$on("indexChangeDetail", (data) => {
                this.handleChangeDetails(data);
            });
        }
        if (this.path === "search") {
            uni.$on("searchChangeDetail", (data) => {
                this.handleChangeDetails(data);
            });
        }
    },
    beforeDestroy() {
        uni.$off("searchChangeDetail");
    },
    methods: {
        // 从scroll-pull触发刷新
        handleRefresh() {
            uni.vibrateShort();
            this.refreshed = false;
            this.$emit("refresh");
            this.listByParams(true);
        },
        // eventbus全局监听触发明细变动
        handleChangeDetails(data) {
            this.$emit("change");
            let needSort = false;
            const item = data.newData;
            const oldDetail = data.oldData;
            if (!this.list[item.time]) {
                // 当前列表不存在该日期key
                const oldDate = `${this.params.year}-${this.params.month}`;
                if (this.path === "search" || (this.path === "index" && oldDate === item.time.substr(0, 7))) {
                    // Search页下：可插入不同月份的数据，Index页下：只插入当前月份数据
                    this.$set(this.list, item.time, {
                        time: item.time,
                        income: item.direction === 1 ? item.money : 0,
                        out: item.direction === 2 ? item.money : 0,
                        list: [item]
                    });
                    needSort = true;
                }
            } else {
                // 如果存在该日期key
                if (this.list[item.time].list.findIndex((v) => v.id === item.id) === -1) {
                    // 如果该日期下，不存在当前明细，则直接插入（如果存在明细的情况，走更新流程的记账时间是同一天的逻辑）
                    if (item.direction === 1) {
                        this.list[item.time].income = this.$util.floatAdd(this.list[item.time].income, item.money);
                    }
                    if (item.direction === 2) {
                        this.list[item.time].out = this.$util.floatAdd(this.list[item.time].out, item.money);
                    }
                    this.list[item.time].list.unshift(item);
                }
            }
            if (oldDetail !== null) {
                // 如果存在旧数据，表示是编辑更新，需要对列表里的旧数据进行处理
                if (oldDetail.time === item.time) {
                    // 更新前后的记账时间，是同一天
                    const oldMoney = oldDetail.money;
                    if (item.money !== oldMoney) {
                        // 金额发生改动，修改计算的支出、收入值
                        if (item.direction === 1) {
                            this.list[item.time].income = this.$util.floatSub(
                                this.list[item.time].income,
                                this.$util.floatSub(oldMoney, item.money)
                            );
                        }
                        if (item.direction === 2) {
                            this.list[item.time].out = this.$util.floatSub(
                                this.list[item.time].out,
                                this.$util.floatSub(oldMoney, item.money)
                            );
                        }
                    }
                    const index = this.list[item.time].list.findIndex((v) => v.id === item.id);
                    this.list[item.time].list.splice(index, 1, item);
                    console.log(this.list);
                } else {
                    // 更新前后的记账时间，不是同一天
                    // 查找旧数据所在的对象位置
                    const index = this.list[oldDetail.time].list.findIndex((v) => v.id === item.id);
                    // 删除对象中的旧数据
                    this.$delete(this.list[oldDetail.time].list, index);
                    if (!this.list[oldDetail.time].list.length) {
                        // 删除后，如果该日期下，不存在记账记录，则从object里删除这一天
                        this.$delete(this.list, oldDetail.time);
                    } else if (oldDetail.direction === 1) {
                        // 更改旧对象中的收入计算值
                        this.list[oldDetail.time].income = this.$util.floatSub(
                            this.list[oldDetail.time].income,
                            oldDetail.money
                        );
                    } else if (oldDetail.direction === 2) {
                        // 更改旧对象中的支出计算值
                        this.list[oldDetail.time].out = this.$util.floatSub(
                            this.list[oldDetail.time].out,
                            oldDetail.money
                        );
                    }
                }
            }
            if (needSort) {
                // 明细需要重新排序
                needSort = false;
                const newKeys = Object.keys(this.list).sort().reverse();
                const newObj = {};
                for (const key of newKeys) {
                    newObj[key] = this.list[key];
                }
                this.list = {};
                this.$nextTick(() => {
                    this.list = Object.assign({}, this.list, newObj);
                });
            }
        },
        // 根据查询条件查询
        listByParams(refresh = false) {
            if (refresh) {
                this.paging.page_no = 0;
                this.list = {};
            } else if (this.loadStatus === "loading" || this.loadStatus === "error" || this.loadStatus === "finished") {
                return;
            }
            this.loadStatus = "loading";
            this.paging.page_no = this.paging.page_no + 1;
            detailSearch({ ...this.params, ...this.paging })
                .then((res) => {
                    refresh && (this.refreshed = true);
                    this.loadStatus = "";
                    if (res.length < this.paging.page_size) {
                        this.loadStatus = "finished";
                    }
                    res.forEach((item) => {
                        if (!this.list[item.time]) {
                            this.$set(this.list, item.time, {
                                time: item.time,
                                income: item.direction === 1 ? item.money : 0,
                                out: item.direction === 2 ? item.money : 0,
                                list: [item]
                            });
                        } else {
                            if (item.direction === 1) {
                                this.list[item.time].income = this.$util.floatAdd(
                                    this.list[item.time].income,
                                    item.money
                                );
                            }
                            if (item.direction === 2) {
                                this.list[item.time].out = this.$util.floatAdd(this.list[item.time].out, item.money);
                            }
                            this.list[item.time].list.push(item);
                        }
                    });
                })
                .catch(() => {
                    this.loadStatus = "error";
                });
        },
        // 出错之后，点击重新加载
        retry() {
            this.paging.page_no = this.paging.page_no - 1;
            this.loadStatus = "";
            this.listByParams();
        },
        // 触发编辑
        handleEdit(item, index) {
            uni.showActionSheet({
                itemList: ["编辑明细", "删除明细"],
                success: (e) => {
                    switch (e.tapIndex) {
                        case 0:
                            uni.navigateTo({
                                url: "/pages/index/edit?item=" + encodeURIComponent(JSON.stringify(item))
                            });
                            break;
                        case 1:
                            uni.showModal({
                                title: "提示",
                                content: "请确认是否要删除该条明细",
                                success: (res) => {
                                    if (res.confirm) {
                                        detailDel(item.id).then(() => {
                                            this.$delete(this.list[item.time].list, index);
                                            if (!this.list[item.time].list.length) {
                                                // 删除后，如果该日期下，不存在记账记录，则从object里删除这一天
                                                this.$delete(this.list, item.time);
                                            } else if (item.direction === 1) {
                                                this.$set(
                                                    this.list[item.time],
                                                    "income",
                                                    this.$util.floatSub(this.list[item.time].income, item.money)
                                                );
                                            } else if (item.direction === 2) {
                                                this.$set(
                                                    this.list[item.time],
                                                    "out",
                                                    this.$util.floatSub(this.list[item.time].out, item.money)
                                                );
                                            }
                                            this.$util.toastSuccess("删除成功");
                                            this.$emit("change");
                                        });
                                    }
                                }
                            });
                            break;
                        default:
                            this.$util.toastError("无效的选项");
                    }
                }
            });
        }
    }
};
</script>

<style scoped lang="scss">
.list-detail-body {
    .detail-wrap {
        .detail-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            padding: 24px 30px;
            color: #000000;
            font-size: 24px;
            font-weight: bold;

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
        }

        .detail-content {
            display: flex;
            flex-direction: column;

            .detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px 30px;
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

                &-info {
                    display: flex;
                    flex-direction: row;
                    align-items: center;

                    &-wrap {
                        display: flex;
                        flex-direction: column;
                        text-align: left;

                        &-name {
                            font-size: 28px;
                            color: #3b4144;
                            overflow: hidden;
                        }

                        &-remark {
                            margin-top: 6px;
                            color: #999;
                            font-size: 24px;
                            overflow: hidden;
                        }

                        &-other {
                            margin-top: 6px;
                            color: #999;
                            font-size: 24px;
                            overflow: hidden;

                            &__nocheck {
                                color: #f0ad4e;
                            }
                        }
                    }
                }

                &-money {
                    font-family: Avenir, Helvetica, Arial, sans-serif;
                    font-size: 30px;
                    font-weight: 600;

                    &__income {
                        color: #4cd964;
                    }

                    &__out {
                        color: #dd524d;
                    }

                    &__other {
                        color: #f0ad4e;
                    }
                }
            }
        }
    }
}
</style>
