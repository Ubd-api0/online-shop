import React from 'react';
import { Link } from 'react-router-dom';
import {
  footerShopLinks,
  footerCompanyLinks,
  footerLegalLinks,
} from '../../static/data';
import appConfig from '../../config/appConfig';

const LinkList = ({ title, items }) => (
  <div>
    <h3 className='font-semibold mb-3 text-white'>{title}</h3>
    <ul className='space-y-2'>
      {items.map((l) => (
        <li key={l.name}>
          <Link
            to={l.link}
            className='text-sm text-gray-400 hover:text-white transition'
          >
            {l.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => (
  <footer className='bg-neutral-900 text-white px-4 py-10 border-t border-neutral-800'>
    <div className='max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
      <div>
        <h2 className='text-lg font-bold mb-2'>{appConfig.name}</h2>
        <p className='text-sm text-gray-400'>{appConfig.tagline}</p>
      </div>

      <LinkList title='Shop' items={footerShopLinks} />
      <LinkList title='Company' items={footerCompanyLinks} />
      <LinkList title='Legal' items={footerLegalLinks} />
    </div>

    <div className='max-w-7xl mx-auto mt-8 pt-6 border-t border-neutral-800 text-sm text-gray-500'>
      © {new Date().getFullYear()} {appConfig.name}. All rights reserved.
    </div>
  </footer>
);

export default Footer;
