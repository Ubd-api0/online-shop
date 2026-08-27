import React from "react";
import DashboardLayout from "../components/Shop/Layout/DashboardLayout";
import AllUsers from "../components/Admin/AllUsers";

const AdminDashboardUsers = () => (
  <DashboardLayout active="admin-users">
    <AllUsers />
  </DashboardLayout>
);

export default AdminDashboardUsers;
