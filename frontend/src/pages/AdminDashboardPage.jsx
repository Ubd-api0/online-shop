import React from "react";
import DashboardLayout from "../components/Shop/Layout/DashboardLayout";
import AdminDashboardMain from "../components/Admin/AdminDashboardMain";

const AdminDashboardPage = () => (
  <DashboardLayout active="admin-dashboard">
    <AdminDashboardMain />
  </DashboardLayout>
);

export default AdminDashboardPage;
