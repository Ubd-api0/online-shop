import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import Loader from "../components/Layout/Loader";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import styles from "../styles/styles";

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const categoryData = searchParams.get("category");
  const { allProducts, isLoading } = useSelector((state) => state.products);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (categoryData === null) {
      setData(allProducts);
    } else {
      setData(
        allProducts && allProducts.filter((i) => i.category === categoryData)
      );
    }
    window.scrollTo(0, 0);
  }, [allProducts, categoryData]);

  return (
    <Layout>
      {isLoading ? (
        <Loader />
      ) : (
        <div className={`${styles.section} py-8`}>
          <h1 className="text-2xl font-semibold text-content mb-6">
            {categoryData || "All Products"}
          </h1>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data &&
              data.map((i, index) => <ProductCard data={i} key={index} />)}
          </div>
          {data && data.length === 0 && (
            <p className="text-center w-full py-24 text-lg text-muted">
              No products found.
            </p>
          )}
        </div>
      )}
    </Layout>
  );
};

export default ProductsPage;
