import React from "react";
import DashboardLayout from "../components/Shop/Layout/DashboardLayout";
import AllEvents from "../components/Admin/AllEvents";

const AdminDashboardEvents = () => (
  <DashboardLayout active="admin-events">
    <AllEvents />
  </DashboardLayout>
);

export default AdminDashboardEvents;
