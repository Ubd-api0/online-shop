import React from 'react';
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillYoutube,
  AiOutlineTwitter,
} from 'react-icons/ai';
import { Link } from 'react-router-dom';
import {
  footercompanyLinks,
  footerProductLinks,
  footerSupportLinks,
} from '../../static/data';

const Footer = () => {
  return (
    <div className='bg-black text-white px-4 py-10'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
        <div>
          <img
            src='/logo.svg'
            className='h-8 mb-3'
          />
          <p className='text-sm text-gray-400'>
            Best online shopping platform.
          </p>
        </div>

        <div>
          <h3 className='font-semibold mb-2'>Company</h3>
          {footercompanyLinks.map((l) => (
            <p className='text-sm text-gray-400'>{l.name}</p>
          ))}
        </div>

        <div>
          <h3 className='font-semibold mb-2'>Shop</h3>
          {footerProductLinks.map((l) => (
            <p className='text-sm text-gray-400'>{l.name}</p>
          ))}
        </div>

        <div>
          <h3 className='font-semibold mb-2'>Support</h3>
          {footerSupportLinks.map((l) => (
            <p className='text-sm text-gray-400'>{l.name}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Footer;
