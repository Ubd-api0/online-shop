import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import DashboardMessages from "../../components/Shop/DashboardMessages";

const ShopInboxPage = () => (
  <DashboardLayout active="inbox">
    <DashboardMessages />
  </DashboardLayout>
);

export default ShopInboxPage;
