import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import CreateEvent from "../../components/Shop/CreateEvent";

const ShopCreateEvents = () => (
  <DashboardLayout active="create-event">
    <CreateEvent />
  </DashboardLayout>
);

export default ShopCreateEvents;
