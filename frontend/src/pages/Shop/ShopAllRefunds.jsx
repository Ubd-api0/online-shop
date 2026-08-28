import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import AllRefundOrders from "../../components/Shop/AllRefundOrders";

const ShopAllRefunds = () => (
  <DashboardLayout active="refunds" title="Refunds">
    <AllRefundOrders />
  </DashboardLayout>
);

export default ShopAllRefunds;
