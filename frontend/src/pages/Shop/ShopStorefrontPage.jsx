import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import StorefrontEditor from "../../components/Shop/StorefrontEditor";

const ShopStorefrontPage = () => (
  <DashboardLayout active="storefront" title="Storefront">
    <StorefrontEditor />
  </DashboardLayout>
);

export default ShopStorefrontPage;
