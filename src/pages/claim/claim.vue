<template>
    <view class="claim">
        <base-subsection class="subsection" :list="subList" :current="subCurrent" @change="handleSubChange" />
        <view class="claim-total-money">总计：{{ claimTotal }}</view>
        <scroll-view
            scroll-y
            :class="['content', subCurrent === 0 ? 'content-0' : '']"
            :style="[contentStyle]"
            @scrolltolower="handleOnBottom"
        >
            <template v-if="claimList.length">
                <checkbox-group class="checkbox-group" @change="checkboxChange">
                    <view v-for="(item, index) in claimList" :key="index" class="claim-item">
                        <view v-if="index === 0 || item.time !== claimList[index - 1].time" class="claim-item-meta">
                            <text class="claim-item-meta-date">{{ item.time }} {{ $util.getWeekDay(item.time) }}</text>
                        </view>
                        <view
                            class="claim-item-content"
                            hover-class="hover"
                            :class="[
                                index < claimList.length && item.time !== claimList[index + 1].time ? 'hide-after' : ''
                            ]"
                        >
                            <view v-if="subCurrent === 0" class="left">
                                <checkbox
                                    style="transform: scale(0.8)"
                                    color="#007aff"
                                    :value="item.id"
                                    :checked="checked.includes(item.id)"
                                />
                            </view>
                            <view class="right" @tap="handleEdit(index)">
                                <base-icon :name="item.category.icon" :title="item.category.name" margin-right="15" />
                                <view class="right-info">
                                    <text class="right-info-title">{{ item.category.name }}</text>
                                    <text v-if="item.remark" class="right-info-remark">{{ item.remark }}</text>
                                    <text class="right-info-account">{{ item.account.name }}</text>
                                </view>
                                <text class="right-money">{{ $util.formatMoney(item.money) }}</text>
                            </view>
                        </view>
                    </view>
                </checkbox-group>
                <base-load-more :status="loadingStatus" @retry="retry" />
            </template>
            <base-empty v-else />
        </scroll-view>
        <view v-if="subCurrent === 0" class="claim-footer safe-area-inset-bottom">
            <view class="left">
                <checkbox-group @change="handleCheckAll">
                    <label class="left-text">
                        <checkbox style="transform: scale(0.8)" color="#007aff" :checked="checkAllStatus" />
                        全选
                        <view v-if="checked.length">，合计：{{ checkedMoney }}</view>
                    </label>
                </checkbox-group>
            </view>
            <view class="right">
                <view class="claim-button" @tap="handleClaim">
                    <text class="claim-button-text">去报销({{ checked.length }})</text>
                </view>
            </view>
        </view>
        <base-popup v-model="pickerVisible" position="bottom" :safe-area-inset-bottom="true">
            <view class="account-title">选择报销入账账户</view>
            <scroll-view scroll-y class="account-scroll">
                <view class="account-scroll-content">
                    <view
                        v-for="(item, index) in accountList"
                        :key="index"
                        class="account-list-item"
                        @tap="handleSelectAccount(item)"
                    >
                        <base-icon
                            size="40"
                            :name="item.icon"
                            :title="item.name"
                            :label="item.name"
                            label-margin-left="18"
                        />
                    </view>
                </view>
            </scroll-view>
        </base-popup>
    </view>
</template>

<script>
import { batchUpdateClaim, getClaim, del as detailDel } from "../../apis/detail";
import BaseSubsection from "../../components/BaseSubsection";
import BaseIcon from "../../components/BaseIcon";
import BaseEmpty from "../../components/BaseEmpty";
import BasePopup from "../../components/BasePopup";
import BaseLoadMore from "@/components/BaseLoadMore";

export default {
    name: "Claim",
    components: {
        BasePopup,
        BaseEmpty,
        BaseIcon,
        BaseSubsection,
        BaseLoadMore
    },
    data() {
        return {
            // tab列表
            subList: ["未报销", "已报销"],
            // 当前选择tab
            subCurrent: 0,
            // 加载状态，支持：loading/finished/error/loadmore
            loadingStatus: "",
            // 报销列表
            claimList: [],
            // 报销总计
            claimTotal: 0,
            pageNo: 0,
            pageSize: 20,
            // 账户列表显示
            pickerVisible: false,
            // 当前报销明细ID,
            activeDetailId: 0,
            // 批量选择数组
            checked: [],
            // 选中合计金额
            checkedMoney: 0
        };
    },
    computed: {
        accountList() {
            return [
                {
                    id: 0,
                    name: "保持原账户",
                    icon: "jinzhi"
                },
                ...this.$store.state.account
            ];
        },
        contentStyle() {
            return {
                // height: this.subCurrent === 0 ? "calc(90vh- 100rpx -160rpx)" : "calc(90vh - 160rpx)"
            };
        },
        checkAllStatus() {
            if (!this.claimList.length) {
                return false;
            } else {
                return this.checked.length === this.claimList.length;
            }
        }
    },
    watch: {
        checked(newValue) {
            let money = 0;
            newValue.forEach((item) => {
                money = this.$util.floatAdd(money, this.claimList.filter((a) => a.id === Number(item))[0].money);
            });
            this.checkedMoney = money;
        }
    },
    onShow() {
        this.initList(true);
    },
    methods: {
        // 出错之后，点击重新加载
        retry() {
            if (this.pageNo) {
                this.pageNo = this.pageNo - 1;
            }
            this.loadStatus = "";
            this.initList();
        },
        handleClaim() {
            if (!this.checked.length) {
                this.$util.toastError("请选择报销明细");
            } else {
                this.pickerVisible = true;
            }
        },
        // checkbox变更
        checkboxChange(e) {
            this.checked = e.target.value.map((item) => Number(item));
        },
        // 选择全部
        handleCheckAll(e) {
            if (e.target.value.length) {
                this.checked = this.claimList.map((item) => item.id);
            } else {
                this.checked = [];
            }
        },
        // 标记需要报销的明细
        handleCheckbox(e) {
            if (e.target.value.length) {
                this.data.add_total = 1;
            } else {
                this.data.add_total = 0;
            }
        },
        handleOnBottom() {
            this.initList();
        },
        // 拉取报销账单
        async initList(refresh = false) {
            if (!refresh && ["loading", "finished"].includes(this.loadingStatus)) {
                return;
            }
            if (refresh) {
                this.claimList = [];
                this.pageNo = 0;
            }
            this.loadingStatus = "loading";
            this.pageNo = this.pageNo + 1;
            const res = await getClaim({ claim: this.subCurrent + 1, page_no: this.pageNo, page_size: this.pageSize });
            if (res.list.length < this.pageSize) {
                this.loadingStatus = "finished";
            } else {
                this.loadingStatus = "";
            }
            this.claimList.push(...res.list);
            this.claimTotal = res.total;
        },
        // 切换sub选项卡
        handleSubChange(index) {
            this.subCurrent = index;
            this.initList(true);
        },
        // FIXME:直接传item，会报错undefined，待继续研究
        // 编辑账单
        handleEdit(index) {
            const item = this.claimList[index];
            if (item.claim !== 2) {
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
                                    success: async (res) => {
                                        if (res.confirm) {
                                            await detailDel(item.id);
                                            this.$util.toastSuccess("删除成功");
                                            await this.initList(true);
                                        }
                                    }
                                });
                                break;
                            default:
                                this.$util.toastError("无效的选项");
                        }
                    }
                });
            } else {
                uni.showActionSheet({
                    itemList: ["删除明细"],
                    success: (e) => {
                        switch (e.tapIndex) {
                            case 0:
                                uni.showModal({
                                    title: "提示",
                                    content: "请确认是否要删除该条明细",
                                    success: async (res) => {
                                        if (res.confirm) {
                                            await detailDel(item.id);
                                            this.$util.toastSuccess("删除成功");
                                            await this.initList(true);
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
        },
        // 选择入账账户
        handleSelectAccount(item) {
            uni.showModal({
                title: "提示",
                content: `选中明细将报销到 ${item.name}`,
                success: async (res) => {
                    if (res.confirm) {
                        const data = [];
                        this.checked.forEach((v) => {
                            let incomeAccountId = item.id;
                            if (item.id === 0) {
                                incomeAccountId = this.claimList.filter((v1) => v1.id === v)[0].account.id;
                            }
                            data.push({
                                id: v,
                                claim: 2,
                                income_account_id: incomeAccountId
                            });
                        });
                        await batchUpdateClaim(data);
                        this.checked = [];
                        this.activeDetailId = 0;
                        this.pickerVisible = false;
                        this.$util.toastSuccess("报销成功");
                        await this.initList(true);
                    }
                }
            });
        }
    }
};
</script>

<style scoped lang="scss">
.account-title {
    font-size: 26px;
    font-weight: bold;
    padding: 30px 0 30px 20px;
    background-color: #f8f8f8;
}
.account-scroll {
    max-height: 55vh;

    &-content {
        display: flex;
        flex-direction: column;
        padding: 0 20px;
        background: #fff;

        .account-list-item {
            display: flex;
            position: relative;
            padding: 25px 10px;
            font-size: 24px;

            &:not(:last-child):after {
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

            &:active {
                background-color: #eeeeee;
            }
        }
    }
}

.claim {
    display: flex;
    flex-direction: column;
    height: 100vh;
    .subsection {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 10vh;
    }
    .claim-total-money {
        display: flex;
        align-items: center;
        height: 80px;
        color: #ff9900;
        font-size: 28px;
        font-weight: bold;
        padding: 0 40px;
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
    .content-0 {
        height: calc(100vh - 10vh - 80px - 100px - env(safe-area-inset-bottom)) !important;
    }
    .content {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 10vh - 80px);
        .hide-after {
            &:after {
                display: none;
            }
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
                    -webkit-transform: scaleY(0.5);
                    transform: scaleY(0.5);
                    background-color: #e5e5e5;
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
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    flex: 1;

                    .right-info {
                        display: flex;
                        flex-direction: column;
                        align-content: flex-start;
                        flex: 1;

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

                    &-money {
                        font-family: Avenir, Helvetica, Arial, sans-serif;
                        font-weight: 600;
                        font-size: 28px;
                        color: #3b4144;
                    }
                }
            }
        }
    }
}
.claim-footer {
    width: 100vw;
    background-color: #f6f6f6;
    display: flex;
    height: 100px;
    justify-content: space-between;
    align-items: center;

    .left {
        display: flex;
        flex-direction: row;
        justify-content: center;
        margin-left: 20px;

        &-text {
            display: flex;
            align-items: center;
            font-size: 24px;
        }
    }

    .claim-button {
        height: 70px;
        margin-right: 20px;
        border-radius: 40px;
        width: 200px;
        background: linear-gradient(-90deg, rgba(38, 196, 65, 1), rgba(1, 174, 50, 1));
        font-size: 24px;
        font-weight: bold;
        color: #ffffff;
        line-height: 70px;
        text-align: center;
    }
}
</style>
