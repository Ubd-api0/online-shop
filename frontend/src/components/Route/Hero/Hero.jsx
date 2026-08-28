import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DEFAULT_IMG =
  'https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg';

const Hero = () => {
  const { hero } = useSelector((state) => state.storefront);

  const title = hero?.title || 'Best Collection for Home Decoration';
  const subtitle =
    hero?.subtitle ||
    'Discover modern furniture and decoration items at best prices.';
  const ctaText = hero?.ctaText || 'Shop Now';
  const ctaLink = hero?.ctaLink || '/products';
  const image = hero?.image || DEFAULT_IMG;

  return (
    <div
      className='w-full min-h-[60vh] sm:min-h-[70vh] flex items-center bg-cover bg-center px-4'
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className='max-w-xl bg-black/45 backdrop-blur-[2px] rounded-lg p-5 sm:p-6'>
        <h1 className='text-2xl sm:text-4xl font-bold text-white'>{title}</h1>
        <p className='text-sm sm:text-base text-gray-100 mt-3'>{subtitle}</p>
        <Link to={ctaLink}>
          <button className='mt-5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-md'>
            {ctaText}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
