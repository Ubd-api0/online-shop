import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { server } from '../server';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const GATEWAY_LABEL = { easypaisa: 'EasyPaisa', jazzcash: 'JazzCash' };

const PaymentMockPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  const gateway = params.get('gateway') || 'gateway';
  const amount = params.get('amount') || '0';
  const orderRef = params.get('orderRef') || '';

  const orderData = useMemo(
    () => JSON.parse(localStorage.getItem('latestOrder') || 'null'),
    []
  );

  const finish = async (outcome) => {
    if (outcome === 'fail') {
      toast.error('Payment cancelled');
      return navigate('/payment');
    }
    if (!orderData || !orderData.cart) {
      toast.error('No pending order found');
      return navigate('/');
    }
    setLoading(true);
    try {
      await axios.post(`${server}/payment/gateway/verify`, { gateway, orderRef });
      const method = orderData.paymentMethod || 'online_full';
      await axios.post(
        `${server}/order/create-order`,
        {
          cart: orderData.cart,
          shippingAddress: orderData.shippingAddress,
          user,
          totalPrice: orderData.totalPrice,
          paymentMethod: method,
          paymentInfo: {
            id: `${gateway}-${orderRef}`,
            type: GATEWAY_LABEL[gateway] || gateway,
            status: method === 'partial_advance' ? 'advance_paid' : 'succeeded',
          },
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      localStorage.setItem('cartItems', JSON.stringify([]));
      localStorage.setItem('latestOrder', JSON.stringify([]));
      toast.success('Payment successful!');
      navigate('/order/success');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not complete order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface-alt text-content">
      <Header />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-surface border border-border rounded-lg p-6 text-center">
          <h1 className="text-xl font-semibold mb-1">
            {GATEWAY_LABEL[gateway] || gateway} — Sandbox
          </h1>
          <p className="text-sm text-muted mb-6">
            No live {GATEWAY_LABEL[gateway] || gateway} credentials are configured
            yet. This screen simulates the gateway so the checkout flow can be
            tested end to end.
          </p>
          <div className="bg-surface-alt rounded-md p-4 mb-6 text-left text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted">Amount</span>
              <span className="font-semibold">Rs. {amount}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">Reference</span>
              <span className="font-mono text-xs">{orderRef}</span>
            </div>
          </div>
          <button
            disabled={loading}
            onClick={() => finish('success')}
            className="w-full h-11 rounded-md bg-green-600 text-white font-semibold mb-3 disabled:opacity-60"
          >
            {loading ? 'Processing…' : 'Simulate successful payment'}
          </button>
          <button
            disabled={loading}
            onClick={() => finish('fail')}
            className="w-full h-11 rounded-md border border-border text-muted"
          >
            Cancel
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentMockPage;
