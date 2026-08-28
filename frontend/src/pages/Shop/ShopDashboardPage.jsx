import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import DashboardHero from "../../components/Shop/DashboardHero";

const ShopDashboardPage = () => (
  <DashboardLayout active="dashboard" title="Dashboard">
    <DashboardHero />
  </DashboardLayout>
);

export default ShopDashboardPage;
