import React from "react";
import DashboardLayout from "../../components/Shop/Layout/DashboardLayout";
import CategoryManager from "../../components/Shop/CategoryManager";

const ShopCategoriesPage = () => (
  <DashboardLayout active="categories" title="Categories">
    <CategoryManager />
  </DashboardLayout>
);

export default ShopCategoriesPage;
