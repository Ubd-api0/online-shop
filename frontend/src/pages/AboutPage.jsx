import React from 'react';
import Layout from '../components/Layout/Layout';
import appConfig from '../config/appConfig';

const AboutPage = () => (
  <Layout>
    <div className='max-w-3xl mx-auto px-4 py-10 space-y-4'>
      <h1 className='text-3xl font-bold text-content'>About {appConfig.name}</h1>
      <p className='text-muted leading-7'>
        {appConfig.name} is an online store built to make shopping simple and
        reliable. We focus on a curated catalogue, honest pricing and fast,
        transparent order handling.
      </p>
      <p className='text-muted leading-7'>
        Every order is prepared and dispatched by our own team. If something is
        made to order, we tell you the expected lead time up front so there are
        no surprises.
      </p>
      <p className='text-muted leading-7'>
        Questions or feedback? Reach us through the{' '}
        <a href='/contact' className='text-orange-500 hover:underline'>
          contact page
        </a>
        .
      </p>
    </div>
  </Layout>
);

export default AboutPage;
