import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import CustomerList from "../../components/Shop/CustomerList";

const ShopCustomersPage = () => (
  <DashboardLayout active="customers">
    <CustomerList />
  </DashboardLayout>
);

export default ShopCustomersPage;
