import React from "react";
import DashboardLayout from "../components/Shop/Layout/DashboardLayout";
import AllProducts from "../components/Admin/AllProducts";

const AdminDashboardProducts = () => (
  <DashboardLayout active="admin-products">
    <AllProducts />
  </DashboardLayout>
);

export default AdminDashboardProducts;
