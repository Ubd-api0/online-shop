import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import ShopSettings from "../../components/Shop/ShopSettings";

const ShopSettingsPage = () => (
  <DashboardLayout active="settings">
    <ShopSettings />
  </DashboardLayout>
);

export default ShopSettingsPage;
