import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from '../../../styles/styles';
import ProductCard from '../ProductCard/ProductCard';

const BestDeals = () => {
  const [data, setData] = useState([]);
  const { allProducts } = useSelector((state) => state.products);

  useEffect(() => {
    if (allProducts?.length) {
      const sorted = [...allProducts].sort((a, b) => b.sold_out - a.sold_out);
      setData(sorted.slice(0, 8)); // better for grid
    }
  }, [allProducts]);

  return (
    <div className='mt-6 md:mt-10'>
      <div className={styles.section}>
        {/* Heading */}
        <div className={`${styles.heading} mb-4`}>
          <h1>Best Deals</h1>
        </div>

        {/* Grid */}
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12'>
          {/* Data */}
          {data?.length > 0 ? (
            data.map((item) => (
              <ProductCard
                key={item._id}
                data={item}
              />
            ))
          ) : (
            <p className='col-span-full text-center text-gray-500 py-10'>
              No products available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BestDeals;
