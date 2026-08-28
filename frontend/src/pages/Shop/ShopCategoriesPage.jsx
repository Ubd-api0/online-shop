import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import CategoryManager from "../../components/Shop/CategoryManager";

const ShopCategoriesPage = () => (
  <DashboardLayout active="categories">
    <CategoryManager />
  </DashboardLayout>
);

export default ShopCategoriesPage;
