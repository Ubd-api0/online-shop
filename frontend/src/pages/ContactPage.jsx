import React from 'react';
import { useSelector } from 'react-redux';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import Layout from '../components/Layout/Layout';
import appConfig from '../config/appConfig';

const Row = ({ icon: Icon, label, value }) =>
  value ? (
    <div className='flex items-start gap-3'>
      <Icon className='mt-1 text-orange-500 shrink-0' size={18} />
      <div>
        <div className='text-sm text-muted'>{label}</div>
        <div className='text-content'>{value}</div>
      </div>
    </div>
  ) : null;

const ContactPage = () => {
  const { storeEmail, storePhone, storeAddress } = useSelector(
    (state) => state.storefront
  );
  const email = appConfig.supportEmail || storeEmail;

  return (
    <Layout>
      <div className='max-w-3xl mx-auto px-4 py-10 space-y-6'>
        <h1 className='text-3xl font-bold text-content'>Contact us</h1>
        <p className='text-muted leading-7'>
          We're happy to help with orders, products or anything else. Reach{' '}
          {appConfig.name} using the details below.
        </p>

        <div className='bg-surface border border-border rounded-md p-5 space-y-4'>
          <Row icon={FiMail} label='Email' value={email} />
          <Row icon={FiPhone} label='Phone' value={storePhone} />
          <Row icon={FiMapPin} label='Address' value={storeAddress} />
          {!email && !storePhone && !storeAddress && (
            <p className='text-sm text-muted'>
              Contact details will appear here once the store owner adds them.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
