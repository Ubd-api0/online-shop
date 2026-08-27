import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import CreateProduct from "../../components/Shop/CreateProduct";

const ShopCreateProduct = () => (
  <DashboardLayout active="create-product">
    <CreateProduct />
  </DashboardLayout>
);

export default ShopCreateProduct;
