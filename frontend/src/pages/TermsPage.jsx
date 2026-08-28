import React from 'react';
import Layout from '../components/Layout/Layout';
import appConfig from '../config/appConfig';

const Section = ({ title, children }) => (
  <div className='space-y-2'>
    <h2 className='text-xl font-semibold text-content'>{title}</h2>
    <div className='text-muted leading-7 space-y-2'>{children}</div>
  </div>
);

const TermsPage = () => (
  <Layout>
    <div className='max-w-3xl mx-auto px-4 py-10 space-y-8'>
      <h1 className='text-3xl font-bold text-content'>Terms of Service</h1>
      <p className='text-muted leading-7'>
        By using {appConfig.name} you agree to the following terms.
      </p>

      <Section title='Orders'>
        <p>
          Placing an order is an offer to buy. We confirm acceptance when the
          order is processed. Prices and availability can change until an order
          is confirmed.
        </p>
      </Section>

      <Section title='Payment'>
        <p>
          Accepted payment methods are shown at checkout. For advance or
          cash-on-delivery orders, the remaining balance is due as described at
          checkout.
        </p>
      </Section>

      <Section title='Returns & refunds'>
        <p>
          Returns are governed by our{' '}
          <a href='/shipping-returns' className='text-orange-500 hover:underline'>
            Shipping &amp; Returns
          </a>{' '}
          policy.
        </p>
      </Section>

      <Section title='Accounts'>
        <p>
          You are responsible for keeping your account credentials secure and for
          activity under your account.
        </p>
      </Section>
    </div>
  </Layout>
);

export default TermsPage;
