import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import DashboardMessages from "../../components/Shop/DashboardMessages";

const ShopInboxPage = () => (
  <DashboardLayout active="inbox" title="Messages">
    <DashboardMessages />
  </DashboardLayout>
);

export default ShopInboxPage;
