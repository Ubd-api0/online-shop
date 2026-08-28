import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import AllEvents from "../../components/Shop/AllEvents";

const ShopAllEvents = () => (
  <DashboardLayout active="events" title="All Events">
    <AllEvents />
  </DashboardLayout>
);

export default ShopAllEvents;
