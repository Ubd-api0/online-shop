import React from 'react';
import Layout from '../components/Layout/Layout';
import appConfig from '../config/appConfig';

const Section = ({ title, children }) => (
  <div className='space-y-2'>
    <h2 className='text-xl font-semibold text-content'>{title}</h2>
    <div className='text-muted leading-7 space-y-2'>{children}</div>
  </div>
);

const PrivacyPage = () => (
  <Layout>
    <div className='max-w-3xl mx-auto px-4 py-10 space-y-8'>
      <h1 className='text-3xl font-bold text-content'>Privacy Policy</h1>
      <p className='text-muted leading-7'>
        This policy explains what information {appConfig.name} collects and how it
        is used.
      </p>

      <Section title='Information we collect'>
        <p>
          Account details you provide (name, email, phone), shipping addresses
          you save, and your order history. Payment is handled by our payment
          providers — we do not store card numbers.
        </p>
      </Section>

      <Section title='How we use it'>
        <p>
          To process and deliver your orders, provide support, and keep your
          account secure. We do not sell your personal information.
        </p>
      </Section>

      <Section title='Your choices'>
        <p>
          You can view and update your profile, addresses and password at any
          time from the Profile page. Contact us to request deletion of your
          account.
        </p>
      </Section>
    </div>
  </Layout>
);

export default PrivacyPage;
