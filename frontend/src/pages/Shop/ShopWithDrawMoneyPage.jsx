import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import WithdrawMoney from "../../components/Shop/WithdrawMoney";

const ShopWithDrawMoneyPage = () => (
  <DashboardLayout active="withdraw">
    <WithdrawMoney />
  </DashboardLayout>
);

export default ShopWithDrawMoneyPage;
