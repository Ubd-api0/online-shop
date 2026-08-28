import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from '../../../styles/styles';
import ProductCard from '../ProductCard/ProductCard';

const FeaturedProduct = () => {
  const { allProducts } = useSelector((state) => state.products);

  return (
    <div className='py-6 md:py-8'>
      <div className={styles.section}>
        {/* Heading */}
        <div className={`${styles.heading} mb-4`}>
          <h1>Featured Products</h1>
        </div>

        {/* Grid */}
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
          {/* Data */}
          {allProducts?.length > 0 ? (
            allProducts.map((item) => (
              <ProductCard
                key={item._id}
                data={item}
              />
            ))
          ) : (
            <p className='col-span-full text-center text-muted py-10'>
              No products available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProduct;
