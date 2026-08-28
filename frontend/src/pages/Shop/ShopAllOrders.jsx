import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import AllOrders from "../../components/Shop/AllOrders";

const ShopAllOrders = () => (
  <DashboardLayout active="orders" title="All Orders">
    <AllOrders />
  </DashboardLayout>
);

export default ShopAllOrders;
