import React from 'react';
import Layout from '../components/Layout/Layout';
import appConfig from '../config/appConfig';

const Section = ({ title, children }) => (
  <div className='space-y-2'>
    <h2 className='text-xl font-semibold text-content'>{title}</h2>
    <div className='text-muted leading-7 space-y-2'>{children}</div>
  </div>
);

const ShippingReturnsPage = () => (
  <Layout>
    <div className='max-w-3xl mx-auto px-4 py-10 space-y-8'>
      <h1 className='text-3xl font-bold text-content'>Shipping & Returns</h1>

      <Section title='Shipping'>
        <p>
          Orders are processed within 1–2 business days. In-stock items ship
          immediately; made-to-order items ship after the lead time shown on the
          product page.
        </p>
        <p>
          A flat shipping fee is calculated at checkout and shown before you pay.
        </p>
      </Section>

      <Section title='Returns'>
        <p>
          If you're not satisfied, you can request a return within 30 days of
          delivery. Items should be unused and in their original condition.
        </p>
        <p>
          To start a return, open the order under Profile → Orders and choose
          “Give a Refund”, or contact us and we'll help.
        </p>
      </Section>

      <Section title='Refunds'>
        <p>
          Once a return is approved, the refund is issued to your original
          payment method. Cash-on-delivery orders are refunded by the method
          agreed with our team.
        </p>
      </Section>

      <p className='text-sm text-muted'>
        Questions about a specific order? Contact {appConfig.name} and we'll sort
        it out.
      </p>
    </div>
  </Layout>
);

export default ShippingReturnsPage;
