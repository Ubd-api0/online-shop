import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import AllRefundOrders from "../../components/Shop/AllRefundOrders";

const ShopAllRefunds = () => (
  <DashboardLayout active="refunds">
    <AllRefundOrders />
  </DashboardLayout>
);

export default ShopAllRefunds;
