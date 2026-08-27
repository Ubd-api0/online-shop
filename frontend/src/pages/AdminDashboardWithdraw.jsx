import React from "react";
import DashboardLayout from "../components/Shop/Layout/DashboardLayout";
import AllWithdraw from "../components/Admin/AllWithdraw";

const AdminDashboardWithdraw = () => (
  <DashboardLayout active="admin-withdraw">
    <AllWithdraw />
  </DashboardLayout>
);

export default AdminDashboardWithdraw;
