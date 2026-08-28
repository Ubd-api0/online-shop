import React from 'react';
import { useSelector } from 'react-redux';
import {
  footercompanyLinks,
  footerProductLinks,
  footerSupportLinks,
} from '../../static/data';

const LinkList = ({ title, items }) => (
  <div>
    <h3 className='font-semibold mb-2'>{title}</h3>
    {items.map((l, i) => (
      <p key={`${l.name}-${i}`} className='text-sm text-gray-400'>
        {l.name}
      </p>
    ))}
  </div>
);

const Footer = () => {
  const { storeName, storeDescription } = useSelector(
    (state) => state.storefront
  );

  return (
    <div className='bg-black text-white px-4 py-10'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
        <div>
          <h2 className='text-lg font-bold mb-2'>{storeName || 'Shop'}</h2>
          <p className='text-sm text-gray-400'>
            {storeDescription || 'Best online shopping platform.'}
          </p>
        </div>

        <LinkList title='Company' items={footercompanyLinks} />
        <LinkList title='Shop' items={footerProductLinks} />
        <LinkList title='Support' items={footerSupportLinks} />
      </div>
    </div>
  );
};

export default Footer;
