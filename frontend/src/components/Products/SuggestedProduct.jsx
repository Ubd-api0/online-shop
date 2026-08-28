import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from '../../styles/styles';
import ProductCard from '../Route/ProductCard/ProductCard';

const SuggestedProduct = ({ data }) => {
  const { allProducts } = useSelector((state) => state.products);
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    if (!data || !allProducts) return;

    const filtered = allProducts.filter(
      (item) => item.category === data.category && item._id !== data._id
    );

    setProductData(filtered);
  }, [data, allProducts]);

  if (!data || productData.length === 0) return null;

  return (
    <div className={`${styles.section} mt-6 px-2 sm:px-0`}>
      {/* Header */}
      <div className='flex justify-between items-center border-b pb-2 mb-4'>
        <h2 className='text-lg md:text-xl font-semibold text-content'>
          Related Products
        </h2>

        <span className='text-sm text-orange-500 cursor-pointer hover:underline'>
          View More
        </span>
      </div>

      {/* Products Grid (Daraz style) */}
      <div
        className='
        grid grid-cols-2 gap-3
        sm:grid-cols-2 sm:gap-4
        md:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
      '
      >
        {productData.slice(0, 10).map((item, index) => (
          <ProductCard
            data={item}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};

export default SuggestedProduct;
