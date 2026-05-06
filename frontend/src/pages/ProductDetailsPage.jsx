import React, { useEffect, useState } from 'react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ProductDetails from '../components/Products/ProductDetails';
import { useParams, useSearchParams } from 'react-router-dom';
import SuggestedProduct from '../components/Products/SuggestedProduct';
import { useSelector } from 'react-redux';

const ProductDetailsPage = () => {
  const { allProducts } = useSelector((state) => state.products);
  const { allEvents } = useSelector((state) => state.events);

  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const eventData = searchParams.get('isEvent');
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!id) return;

    let foundData = null;

    if (eventData) {
      foundData = allEvents?.find((i) => i._id === id);
    } else {
      foundData = allProducts?.find((i) => i._id === id);
    }

    setData(foundData || null);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, eventData, allProducts, allEvents]);

  return (
    <div>
      <Header />

      {/* Product Details */}
      {data ? (
        <ProductDetails data={data} />
      ) : (
        <div className='text-center py-20 text-gray-500'>
          Loading product...
        </div>
      )}

      {/* Suggested Products */}
      {!eventData && data && <SuggestedProduct data={data} />}

      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
