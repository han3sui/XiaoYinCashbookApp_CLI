<template>
    <view class="edit-detail">
        <base-subsection
            id="base-subsection"
            class="subsection"
            :list="subList"
            :current="subCurrent"
            @change="changeSubCurrent"
        ></base-subsection>
        <view class="menu-wrap" :style="{ height: `${Number(scrollHeight)}px` }">
            <scroll-view class="left" scroll-y :scroll-top="leftScrollTop" scroll-with-animation>
                <template v-for="(item, index) in category[subListMap[subCurrent].key]">
                    <view
                        :key="index"
                        class="left-item"
                        :class="[index === active ? 'left-item-active' : '']"
                        @tap="selectCategory(index)"
                        >{{ item.name }}</view
                    >
                </template>
            </scroll-view>
            <scroll-view
                class="right"
                scroll-y
                :scroll-top="rightScrollTop"
                scroll-with-animation
                @scroll="rightScroll"
            >
                <template v-for="(v1, v1index) in category[subListMap[subCurrent].key]">
                    <view
                        :key="v1index"
                        class="category-container"
                        :style="
                            v1index === category[subListMap[subCurrent].key].length - 1 &&
                            `min-height:${Number(scrollHeight - 20)}px`
                        "
                    >
                        <view class="category-title">{{ v1.name }}</view>
                        <view class="category-wrap">
                            <template v-for="(v2, v2index) in v1.nodes">
                                <view
                                    :key="v2index"
                                    class="category-item"
                                    :class="[
                                        v2.id === detailData.category_id ||
                                        v2.income_account_id === detailData.income_account_id ||
                                        v2.account_id === detailData.account_id
                                            ? 'category-item-active'
                                            : ''
                                    ]"
                                    @tap="handleSelect(v2)"
                                >
                                    <base-icon size="50" margin-right="0" :name="v2.icon" :title="v2.name" />
                                    <view class="category-item-title">{{ v2.name }}</view>
                                </view>
                            </template>
                        </view>
                    </view>
                </template>
            </scroll-view>
        </view>
        <tui-bottom-popup background-color="transparent" :show="keyboardShow" @close="keyboardShow = false">
            <view class="keyboard">
                <view class="keyboard-meta">
                    <view class="keyboard-meta-left">
                        <view v-if="detailData.direction === 2" class="keyboard-meta-claim">
                            <checkbox-group @change="handleCheckbox">
                                <checkbox
                                    value="1"
                                    color="#007aff"
                                    :checked="detailData.claim !== 0"
                                    style="transform: scale(0.8)"
                                    >报销</checkbox
                                >
                            </checkbox-group>
                        </view>
                        <view class="keyboard-meta-remark">
                            <base-icon name="remark" color="#808080" />
                            <input
                                v-model="detailData.remark"
                                class="keyboard-meta-remark-input"
                                placeholder="点击备注"
                                placeholder-style="font-size:28rpx"
                            />
                        </view>
                    </view>
                    <view class="keyboard-meta-money">
                        <text>{{ detailData.money }}</text>
                    </view>
                </view>
                <view class="keyboard-content">
                    <view class="keyboard-main">
                        <view
                            v-for="(item, index) in keyData"
                            :key="index"
                            class="keyboard-main-item"
                            @tap="handleEdit(item)"
                        >
                            <text v-if="item !== 'd'">{{ item }}</text>
                            <base-icon v-else name="delete" size="60" />
                        </view>
                    </view>
                    <view class="keyboard-menu">
                        <view class="keyboard-menu-view keyboard-menu-date" @tap="handleShowCalendar">
                            <view class="picker-date">{{ detailData.time }}</view>
                        </view>
                        <view class="keyboard-menu-view keyboard-menu-account">
                            <!-- <select-account
                                v-if="detailData.direction !== 3"
                                :active.sync="accountIndex"
                                class="picker-account"
                            ></select-account> -->
                            <view
                                v-if="detailData.direction !== 3"
                                class="picker-account"
                                @tap="handleShowAccountList"
                                >{{ accountList[accountIndex].name }}</view
                            >
                            <view v-else class="picker-none">-</view>
                        </view>
                        <view class="keyboard-menu-view keyboard-menu-button" @tap="handleSave">
                            <text class="keyboard-menu-button-text">完成</text>
                        </view>
                    </view>
                </view>
            </view>
        </tui-bottom-popup>
        <select-account
            v-model="selectAccountShow"
            :active="accountIndex"
            @confirm="handleAccountConfirm"
        ></select-account>
        <tui-calendar
            ref="calendar"
            is-fixed
            :min-date="dateStart"
            :max-date="dateEnd"
            :init-start-date="detailData.time"
            @change="handleChangeDate"
        ></tui-calendar>
    </view>
</template>

<script>
import BaseIcon from "../components/BaseIcon";
import BaseSubsection from "./BaseSubsection";
import SelectAccount from "./SelectAccount.vue";
import * as detail from "../apis/detail";
import { getDate } from "@/utils/util";

export default {
    name: "EditDetail",
    components: { BaseSubsection, BaseIcon, SelectAccount },
    props: {
        detail: {
            type: Object,
            default() {
                return {
                    // 金额
                    money: 0,
                    // 账单日期
                    time: getDate(),
                    // 备注
                    remark: "",
                    // 类别类型，1:收入，2:支出，3:转账
                    direction: 2,
                    // 转出、支出账户
                    account_id: 0,
                    // 转入账户
                    income_account_id: 0,
                    // 分类
                    category_id: 0,
                    // 是否报销，0：不报销，1：待报销，2：已报销
                    claim: 0
                };
            }
        }
    },
    data() {
        return {
            // 显示账户列表
            selectAccountShow: false,
            // 日历组件
            calendarStatus: false,
            // 账户选择
            accountIndex: 0,
            // 虚拟键盘状态
            keyboardShow: false,
            // 竖向滚动最大高度
            scrollHeight: 0,
            // tab标签
            subList: ["支出", "收入", "转账"],
            // tab当前标签
            subCurrent: 0,
            // sub对应的分类map
            subListMap: {
                0: {
                    direction: 2,
                    key: "out"
                },
                1: {
                    direction: 1,
                    key: "income"
                },
                2: {
                    direction: 3,
                    key: "transfer"
                }
            },
            // 账单明细
            detailData: {},
            // 左侧滚动条距离顶部高度
            leftScrollTop: 0,
            // 右边栏目scroll-view的滚动条高度
            rightScrollTop: 0,
            // 选中类别
            active: 0,
            // 右侧每个item到顶部距离
            rightItemTop: [],
            // 键盘数据
            keyData: ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "d"]
        };
    },
    computed: {
        // 编辑状态下启用底部安全区
        safeArea() {
            return this.detail.id !== 0;
        },
        // 账户列表
        accountList() {
            return this.$store.state.account;
        },
        // picker开始时间
        dateStart() {
            return getDate("start");
        },
        // picker结束时间
        dateEnd() {
            return getDate("end");
        },
        // 类别数据
        category() {
            const map = {};
            Object.assign(map, this.$store.state.category);
            const incomeAccountList = this.$store.state.account.map((item) => {
                return {
                    income_account_id: item.id,
                    name: item.name,
                    icon: item.icon
                };
            });
            const accountList = this.$store.state.account.map((item) => {
                return {
                    account_id: item.id,
                    name: item.name,
                    icon: item.icon
                };
            });
            map.transfer = [
                {
                    name: "转出账户",
                    nodes: accountList
                },
                {
                    name: "转入账户",
                    nodes: incomeAccountList
                }
            ];
            return map;
        }
    },
    watch: {
        category() {
            setTimeout(() => {
                this.getRightItemTop();
            }, 100);
        },
        accountList() {
            this.accountIndex = 0;
            this.detailData.account_id = this.accountList[this.accountIndex].id;
        }
    },
    mounted() {
        // 获取scroll的最大高度
        uni.createSelectorQuery()
            .in(this)
            .select("#base-subsection")
            .boundingClientRect((res) => {
                if (res) {
                    this.scrollHeight = uni.getSystemInfoSync().windowHeight - res.height - res.top - 10;
                } else {
                    this.scrollHeight = uni.getSystemInfoSync().windowHeight;
                }
            })
            .exec();
        // 获取右侧元素距离顶部高度
        this.getRightItemTop();
        // 将props传递的账单详情，赋值给data里的账单
        this.detailData = Object.assign({}, this.detailData, this.detail);
        if (!this.detail.account_id) {
            // 明细新增模式，初始化账户ID
            this.detailData.account_id = this.accountList[this.accountIndex].id;
        } else {
            // 明细编辑模式
            // 设定当前的direction，支出，收入，转账
            Object.keys(this.subListMap).forEach((key) => {
                if (this.subListMap[key].direction === this.detail.direction) {
                    this.subCurrent = key;
                }
            });
            // 设定当前的选中账户
            this.accountIndex = this.accountList.findIndex((e) => e.id === this.detail.account_id);
            // 如果不是转账模式下，自动滚动到对应的分类
            if (this.detailData.direction !== 3) {
                // 第一步循环主分类，然后循环子分类，查询到子分类ID和当前账单的分类ID相等情况，赋值主分类的index到selectCategory方法
                this.category[this.subListMap[this.subCurrent].key].forEach((item, index) => {
                    item.nodes.forEach((v) => {
                        if (v.id === this.detailData.category_id) {
                            this.selectCategory(index);
                        }
                    });
                });
            }
            // 设置虚拟键盘显示
            this.keyboardShow = true;
        }
    },
    methods: {
        handleAccountConfirm(item, index) {
            this.accountIndex = index;
        },
        handleShowAccountList() {
            this.selectAccountShow = true;
        },
        handleShowCalendar() {
            this.$refs.calendar.show();
        },
        /**
         * 左侧menu选择
         * @param index
         * @param disable,是否禁止右侧自动滚动(防止右侧滚动触发左侧选择的时候，重复调用右侧滚动)
         */
        selectCategory(index, disable) {
            if (this.rightItemTop.length === 0) {
                setTimeout(() => {
                    this.selectCategory(index, disable);
                }, 50);
                return;
            }
            if (index === this.active) return;
            this.$nextTick(() => {
                if (!disable) {
                    this.rightScrollTop = this.rightItemTop[index];
                }
                // 设置选中
                this.active = index;
                // 将菜单活动item垂直居中
                this.leftScrollTop = index * 48 + 48 / 2 - this.scrollHeight / 2;
            });
        },
        // 右侧滚动事件
        rightScroll(e) {
            // 如果到顶部的距离不足，直接设定到了第一个item，防止抖动
            if (e.detail.scrollTop <= 48 / 2) {
                this.selectCategory(0, true);
                return;
            }
            setTimeout(() => {
                const scrollHeight = e.detail.scrollTop + 48 / 2;
                for (let i = 0; i < this.rightItemTop.length; i++) {
                    const height1 = this.rightItemTop[i];
                    const height2 = this.rightItemTop[i + 1];
                    // 如果不存在height2，意味着数据循环已经到了最后一个，设置左边菜单为最后一项即可
                    if (!height2 || (scrollHeight >= height1 && scrollHeight < height2)) {
                        this.selectCategory(i, true);
                        return;
                    }
                }
            }, 10);
        },
        // 获取右侧每个包裹元素到顶部的距离
        getRightItemTop() {
            uni.createSelectorQuery()
                .in(this)
                .selectAll(".category-container")
                .boundingClientRect((res) => {
                    // 如果节点尚未生成，rects值为[](因为用selectAll，所以返回的是数组)，循环调用执行
                    if (!res.length) {
                        setTimeout(() => {
                            this.getRightItemTop();
                        }, 100);
                        return;
                    }
                    this.rightItemTop = [];
                    res.forEach((item) => {
                        // 这里减去res[0].top，是因为第一项顶部可能不是贴到导航栏(比如有个搜索框的情况)
                        this.rightItemTop.push(item.top - res[0].top);
                    });
                })
                .exec();
        },
        // 选择操作
        handleSelect(item) {
            if (item.id) {
                this.detailData.category_id = item.id;
            }
            if (item.income_account_id) {
                this.detailData.income_account_id = item.income_account_id;
            }
            if (item.account_id) {
                this.detailData.account_id = item.account_id;
                this.accountIndex = this.accountList.findIndex((e) => e.id === item.account_id);
            }
            if (this.detailData.direction === 3) {
                if (this.detailData.income_account_id !== 0 && this.detailData.account_id !== 0) {
                    this.keyboardShow = true;
                }
            } else {
                this.keyboardShow = true;
            }
        },
        // 顶部tab点击
        changeSubCurrent(e) {
            if (this.detail.id) {
                this.$util.toastError("编辑状态禁止切换");
                return;
            }
            this.subCurrent = e;
            this.detailData.direction = this.subListMap[e].direction;
            this.detailData.category_id = 0;
            this.detailData.income_account_id = 0;
            setTimeout(() => {
                this.getRightItemTop();
            }, 100);
        },
        // 选择时间
        handleChangeDate(e) {
            this.detailData.time = e.result;
        },
        // 选择账户
        handleChangeAccount(e) {
            this.accountIndex = e.target.value;
            this.detailData.account_id = this.accountList[this.accountIndex].id;
        },
        // 记录账单
        handleEdit(e) {
            uni.vibrateShort();
            let money = this.detailData.money;
            if (e === "d") {
                if (money.toString().length > 1) {
                    money = money.toString().substr(0, money.toString().length - 1);
                } else {
                    money = 0;
                }
            } else {
                if (money.toString().length > 8) {
                    this.$util.toastError("超出金额限制");
                    return;
                }
                if (/^[0][0-9]$/.test(money + e)) {
                    money = e;
                } else if (/^[0-9]+(.)?([0-9]{1,2})?$/.test(money + e)) {
                    money = money + e;
                }
            }
            this.detailData.money = money;
        },
        // 保存账单
        handleSave() {
            this.detailData.money = Number(this.detailData.money);
            if (this.detailData.direction !== 2) {
                this.detailData.claim = 0;
            }
            if (!this.detail.id) {
                detail.save(this.detailData).then((res) => {
                    // 触发全局自定义事件，返回给明细列表页面数据
                    uni.$emit("indexChangeDetail", { newData: res, oldData: null });
                    uni.$emit("searchChangeDetail", { newData: res, oldData: null });
                    this.$util.toastSuccess("保存成功");
                    Object.assign(this.detailData, {
                        money: 0,
                        remark: "",
                        claim: 0
                    });
                    this.keyboardShow = false;
                });
            } else {
                detail.update(this.detail.id, this.detailData).then((res) => {
                    // 触发全局自定义事件，返回给明细列表页面数据
                    uni.$emit("indexChangeDetail", { newData: res, oldData: this.detail });
                    uni.$emit("searchChangeDetail", { newData: res, oldData: this.detail });
                    uni.navigateBack();
                });
            }
        },
        // 标记是否为报销
        handleCheckbox(e) {
            if (e.target.value.length) {
                this.detailData.claim = 1;
            } else {
                this.detailData.claim = 0;
            }
        }
    }
};
</script>

<style scoped lang="scss">
.keyboard {
    width: 100%;
    height: auto;
    background: #f5f5f5;
    overflow: hidden;
    .keyboard-meta {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 20px 20px 0 20px;
        &-left {
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 70%;
            color: #808080;
            .keyboard-meta-claim {
                width: 130px;
            }
            .keyboard-meta-remark {
                display: flex;
                flex-direction: row;
                align-items: center;
                font-size: 28px;
                line-height: 28px;
                text-align: left;
                padding-left: 10px;
                &-input {
                    padding-left: 10px;
                }
            }
        }
        &-money {
            font-size: 34px;
            font-weight: bold;
            text-align: right;
            width: 30%;
            overflow: hidden;
        }
    }
    .keyboard-content {
        display: flex;
        flex-direction: row;
        padding: 10px;
        .keyboard-main {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            width: 75%;
            overflow: hidden;
            &-item {
                display: flex;
                align-items: center;
                justify-content: space-around;
                width: calc(calc(100% / 3) - 20px);
                margin: 10px;
                height: 80px;
                border-radius: 10px;
                background: #fff;
                font-weight: 600;
                font-family: "Times New Roman";
                font-size: 34px;
                &:active {
                    background-color: #eeeeee;
                }
            }
        }
        .keyboard-menu {
            display: flex;
            flex-direction: column;
            width: 25%;
            overflow: hidden;
            // .picker-none {
            //     display: flex;
            //     align-items: center;
            //     justify-content: center;
            //     height: 100%;
            //     width: 100%;
            // }
            &-view {
                position: relative;
                height: 80px;
                background-color: #fff;
                border-radius: 10px;
                margin: 10px;
                &:active {
                    background-color: #eeeeee;
                }
                .picker-none {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    width: 100%;
                }
                .picker {
                    .picker-text {
                        flex: 1;
                        text-align: center;
                        line-height: 80px;
                        font-size: 24px;
                        font-weight: 400;
                    }
                }
            }
            .keyboard-menu-date {
                .picker-date {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 400;
                    height: 100%;
                    width: 100%;
                }
            }
            .keyboard-menu-account {
                .picker-account {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 400;
                    height: 100%;
                    width: 100%;
                }
            }
            .keyboard-menu-button {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 180px !important;
                background-color: #007aff !important;
                &:active {
                    background-color: #6495ed !important;
                }
                &-text {
                    color: #ffffff;
                    font-size: 28px !important;
                    font-weight: bold;
                }
            }
        }
    }
}
.edit-detail {
    display: flex;
    flex-direction: column;
    .subsection {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px 0;
    }
    .menu-wrap {
        display: flex;
        flex-direction: row;
        padding: 0 20px;
        .left {
            width: 20%;
            border-radius: 10px;
            background-color: #f6f6f6;
            .left-item {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 96px;
                font-size: 24px;
                font-weight: 400;
            }
            .left-item-active {
                background-color: #ffffff;
                position: relative;
                &:before {
                    content: "";
                    position: absolute;
                    border-left: 8px solid #2979ff;
                    height: 28px;
                    left: 0;
                    top: 34px;
                }
            }
        }
        .right {
            flex: 1;
            background-color: #fafafa;
            .category-container {
                display: flex;
                flex-direction: column;
                background-color: #ffffff;
                margin: 20px;
                .category-title {
                    font-size: 24px;
                    font-weight: 700;
                    margin-top: 10px;
                    margin-left: 10px;
                }
                .category-wrap {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: flex-start;
                    background-color: #ffffff;
                    .category-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 25%;
                        height: 130px;
                        &-title {
                            text-align: center;
                            margin-top: 5px;
                            font-size: 24px;
                            font-weight: 400;
                        }
                        &-active {
                            background-color: $uni-bg-color-hover;
                        }
                    }
                }
            }
        }
    }
}
</style>
