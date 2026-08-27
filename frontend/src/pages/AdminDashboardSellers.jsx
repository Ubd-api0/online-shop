import React from "react";
import DashboardLayout from "../components/Shop/Layout/DashboardLayout";
import AllSellers from "../components/Admin/AllSellers";

const AdminDashboardSellers = () => (
  <DashboardLayout active="admin-dashboard">
    <AllSellers />
  </DashboardLayout>
);

export default AdminDashboardSellers;
