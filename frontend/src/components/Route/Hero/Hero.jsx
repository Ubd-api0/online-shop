import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../../styles/styles';

const Hero = () => {
  return (
    <div
      className='w-full min-h-[60vh] sm:min-h-[70vh] flex items-center bg-cover bg-center px-4'
      style={{
        backgroundImage:
          'url(https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg)',
      }}
    >
      <div className='max-w-xl'>
        <h1 className='text-2xl sm:text-4xl font-bold text-gray-800'>
          Best Collection for Home Decoration
        </h1>

        <p className='text-sm sm:text-base text-gray-600 mt-3'>
          Discover modern furniture and decoration items at best prices.
        </p>

        <Link to={'/products'}>
          <button className='mt-5 bg-orange-500 text-white px-5 py-2 rounded-md'>
            Shop Now
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
