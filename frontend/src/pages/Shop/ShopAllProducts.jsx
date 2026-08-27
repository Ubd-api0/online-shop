import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import AllProducts from "../../components/Shop/AllProducts";

const ShopAllProducts = () => (
  <DashboardLayout active="products">
    <AllProducts />
  </DashboardLayout>
);

export default ShopAllProducts;
