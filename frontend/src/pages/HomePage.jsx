import React from 'react';
import Layout from '../components/Layout/Layout';
import Hero from '../components/Route/Hero/Hero';
import Categories from '../components/Route/Categories/Categories';
import BestDeals from '../components/Route/BestDeals/BestDeals';
import Events from '../components/Events/Events';
import FeaturedProduct from '../components/Route/FeaturedProduct/FeaturedProduct';

const HomePage = () => {
  return (
    <Layout>
      <Hero />
      <Categories />
      <BestDeals />
      <Events />
      <FeaturedProduct />
    </Layout>
  );
};

export default HomePage;
