import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import OrderDetails from "../../components/Shop/OrderDetails";

const ShopOrderDetails = () => (
  <DashboardLayout active="orders">
    <OrderDetails />
  </DashboardLayout>
);

export default ShopOrderDetails;
