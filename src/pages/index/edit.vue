<template>
    <edit-detail :detail="detail" />
</template>

<script>
import EditDetail from "../../components/EditDetail";
export default {
    name: "Edit",
    components: { EditDetail },
    data() {
        return {
            detail: {
                // 账单ID
                id: 0,
                // 金额
                money: 0,
                // 账单日期
                time: "",
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
                // 报销
                claim: 0
            }
        };
    },
    onLoad(e) {
        if (e.item) {
            const v = JSON.parse(decodeURIComponent(e.item));
            Object.assign(this.detail, {
                id: v.id,
                money: v.money,
                time: v.time,
                remark: v.remark,
                direction: v.direction,
                account_id: v.account.id,
                income_account_id: v.income_account.id,
                category_id: v.category.id,
                claim: v.claim
            });
        }
    }
};
</script>

<style scoped></style>
