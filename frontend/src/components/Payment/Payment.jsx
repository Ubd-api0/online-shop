import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/styles';
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { server } from '../../server';
import { toast } from 'react-toastify';
import { RxCross1 } from 'react-icons/rx';
import { effectivePolicy } from '../../utils/paymentPolicy';

const METHOD_LABEL = {
  cod: 'Cash on Delivery',
  online_full: 'Full online payment',
  partial_advance: 'Advance payment',
};

const Payment = () => {
  const [orderData, setOrderData] = useState(null);
  const [config, setConfig] = useState(null);
  const [open, setOpen] = useState(false);

  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    setOrderData(JSON.parse(localStorage.getItem('latestOrder')));
    axios
      .get(`${server}/payment/config`)
      .then((res) => setConfig(res.data))
      .catch(() => setConfig({ gateways: {}, paymentSettings: null }));
  }, []);

  const method = orderData?.paymentMethod || 'cod';
  const policy = useMemo(
    () => effectivePolicy(config?.paymentSettings, orderData?.cart || []),
    [config, orderData]
  );

  const totalPrice = Number(orderData?.totalPrice || 0);
  const advancePercent = policy.advancePercent;
  const advanceAmount =
    method === 'partial_advance'
      ? Math.round((totalPrice * advancePercent) / 100)
      : 0;
  const remainingAmount =
    method === 'partial_advance'
      ? Math.round(totalPrice - advanceAmount)
      : method === 'cod'
      ? Math.round(totalPrice)
      : 0;
  const amountDueNow =
    method === 'online_full'
      ? totalPrice
      : method === 'partial_advance'
      ? advanceAmount
      : 0;

  const orderRef = useMemo(() => `ORD-${Date.now()}`, []);

  const placeOrder = async (paymentInfo) => {
    const reqConfig = { headers: { 'Content-Type': 'application/json' } };
    const payload = {
      cart: orderData?.cart,
      shippingAddress: orderData?.shippingAddress,
      user,
      totalPrice,
      paymentMethod: method,
      paymentInfo,
    };
    await axios.post(`${server}/order/create-order`, payload, reqConfig);
    localStorage.setItem('cartItems', JSON.stringify([]));
    localStorage.setItem('latestOrder', JSON.stringify([]));
    toast.success('Order placed successfully!');
    navigate('/order/success');
    window.location.reload();
  };

  // ---- COD -------------------------------------------------------------
  const codHandler = async (e) => {
    e.preventDefault();
    try {
      await placeOrder({ type: 'Cash On Delivery', status: 'pending_cod' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    }
  };

  // ---- Stripe --------------------------------------------------------------
  const stripeHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${server}/payment/process`, {
        amount: Math.round(amountDueNow * 100),
      });
      if (!stripe || !elements) return;
      const result = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: elements.getElement(CardNumberElement) },
      });
      if (result.error) return toast.error(result.error.message);
      if (result.paymentIntent.status === 'succeeded') {
        await placeOrder({
          id: result.paymentIntent.id,
          status: method === 'partial_advance' ? 'advance_paid' : 'succeeded',
          type: 'Credit Card',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  // ---- PayPal --------------------------------------------------------------
  const createPaypalOrder = (data, actions) =>
    actions.order
      .create({
        purchase_units: [
          {
            description: `Store order (${METHOD_LABEL[method]})`,
            amount: { currency_code: 'USD', value: String(amountDueNow) },
          },
        ],
        application_context: { shipping_preference: 'NO_SHIPPING' },
      })
      .then((id) => id);

  const onPaypalApprove = async (data, actions) =>
    actions.order.capture().then(async (details) => {
      if (!details?.payer) return;
      try {
        await placeOrder({
          id: details.payer.payer_id,
          status: method === 'partial_advance' ? 'advance_paid' : 'succeeded',
          type: 'Paypal',
        });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Payment failed');
      }
    });

  // ---- EasyPaisa / JazzCash ---------------------------------------------
  const walletHandler = async (gateway) => {
    try {
      const { data } = await axios.post(
        `${server}/payment/${gateway}/initiate`,
        {
          amount: amountDueNow,
          orderRef,
          customerEmail: user?.email,
          customerMobile: user?.phoneNumber,
        }
      );

      if (data.mock && data.redirectUrl) {
        if (data.message) toast.info(data.message);
        window.location.href = data.redirectUrl;
        return;
      }

      if (gateway === 'jazzcash' && data.paymentData) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paymentUrl;
        Object.entries(data.paymentData).forEach(([k, v]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = v;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }

      window.location.href = data.redirectUrl || data.paymentUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  if (!orderData) {
    return (
      <div className="w-full flex justify-center py-16 text-content">
        No order in progress.{' '}
        <button onClick={() => navigate('/')} className="pl-2 text-brand underline">
          Continue shopping
        </button>
      </div>
    );
  }

  const gw = policy.gateways;

  return (
    <div className="w-full flex flex-col items-center py-8 px-3">
      <div className="w-full max-w-5xl flex flex-col 800px:flex-row gap-6">
        <div className="w-full 800px:w-[62%]">
          {method === 'cod' ? (
            <div className="bg-surface border border-border rounded-md p-6">
              <h4 className="text-[18px] font-[600] text-content mb-2">
                Cash on Delivery
              </h4>
              <p className="text-muted text-sm mb-5">
                You will pay Rs. {remainingAmount} in cash when your order is
                delivered. No online payment is required now.
              </p>
              <button
                onClick={codHandler}
                className="w-full h-[46px] rounded-md bg-brand text-white font-[600]"
              >
                Place Order
              </button>
            </div>
          ) : (
            <PaymentInfo
              user={user}
              open={open}
              setOpen={setOpen}
              gateways={gw}
              paypalClientId={config?.paypalClientId}
              amountLabel={
                method === 'partial_advance'
                  ? `Pay ${advancePercent}% advance (Rs. ${advanceAmount})`
                  : `Pay Rs. ${amountDueNow}`
              }
              stripeHandler={stripeHandler}
              onApprove={onPaypalApprove}
              createOrder={createPaypalOrder}
              walletHandler={walletHandler}
            />
          )}
        </div>

        <div className="w-full 800px:w-[38%]">
          <CartData
            orderData={orderData}
            method={method}
            advancePercent={advancePercent}
            advanceAmount={advanceAmount}
            remainingAmount={remainingAmount}
            amountDueNow={amountDueNow}
          />
        </div>
      </div>
    </div>
  );
};

const RadioDot = ({ active }) => (
  <div className="w-[22px] h-[22px] rounded-full border-[3px] border-muted flex items-center justify-center shrink-0">
    {active && <div className="w-[11px] h-[11px] bg-brand rounded-full" />}
  </div>
);

const PaymentInfo = ({
  user,
  open,
  setOpen,
  gateways,
  paypalClientId,
  amountLabel,
  stripeHandler,
  onApprove,
  createOrder,
  walletHandler,
}) => {
  const options = [
    gateways.stripe && 'card',
    gateways.paypal && paypalClientId && 'paypal',
    gateways.easypaisa && 'easypaisa',
    gateways.jazzcash && 'jazzcash',
  ].filter(Boolean);

  const [select, setSelect] = useState(options[0] || 'card');

  if (options.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-md p-6 text-muted">
        No online payment gateway is enabled for this store. Please contact the
        store or choose Cash on Delivery.
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-border rounded-md p-5 pb-8 space-y-4">
      {options.includes('card') && (
        <div>
          <button
            type="button"
            className="flex w-full items-center pb-4 border-b border-border"
            onClick={() => setSelect('card')}
          >
            <RadioDot active={select === 'card'} />
            <span className="text-[17px] pl-3 font-[600] text-content">
              Debit / Credit Card
            </span>
          </button>
          {select === 'card' && (
            <form className="w-full pt-4" onSubmit={stripeHandler}>
              <div className="flex gap-3 pb-3">
                <div className="w-1/2">
                  <label className="block pb-1 text-sm text-muted">
                    Name on Card
                  </label>
                  <input
                    required
                    defaultValue={user?.name}
                    className={`${styles.input} bg-surface border-border text-content`}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block pb-1 text-sm text-muted">Exp Date</label>
                  <CardExpiryElement
                    className={`${styles.input} bg-surface border-border`}
                  />
                </div>
              </div>
              <div className="flex gap-3 pb-4">
                <div className="w-1/2">
                  <label className="block pb-1 text-sm text-muted">
                    Card Number
                  </label>
                  <CardNumberElement
                    className={`${styles.input} bg-surface border-border`}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block pb-1 text-sm text-muted">CVV</label>
                  <CardCvcElement
                    className={`${styles.input} bg-surface border-border`}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full h-[45px] rounded-md bg-brand text-white text-[16px] font-[600]"
              >
                {amountLabel}
              </button>
            </form>
          )}
        </div>
      )}

      {options.includes('paypal') && (
        <div>
          <button
            type="button"
            className="flex w-full items-center pb-4 border-b border-border"
            onClick={() => setSelect('paypal')}
          >
            <RadioDot active={select === 'paypal'} />
            <span className="text-[17px] pl-3 font-[600] text-content">
              PayPal
            </span>
          </button>
          {select === 'paypal' && (
            <div className="pt-4">
              <button
                className="w-full h-[45px] rounded-md bg-brand text-white font-[600]"
                onClick={() => setOpen(true)}
              >
                {amountLabel}
              </button>
              {open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[99999] p-4">
                  <div className="w-full max-w-md max-h-[80vh] bg-surface text-content rounded-md p-8 relative overflow-y-auto">
                    <RxCross1
                      size={26}
                      className="cursor-pointer absolute top-4 right-4"
                      onClick={() => setOpen(false)}
                    />
                    <PayPalScriptProvider
                      options={{ 'client-id': paypalClientId }}
                    >
                      <PayPalButtons
                        style={{ layout: 'vertical' }}
                        onApprove={onApprove}
                        createOrder={createOrder}
                      />
                    </PayPalScriptProvider>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {options.includes('easypaisa') && (
        <div>
          <button
            type="button"
            className="flex w-full items-center pb-4 border-b border-border"
            onClick={() => setSelect('easypaisa')}
          >
            <RadioDot active={select === 'easypaisa'} />
            <span className="text-[17px] pl-3 font-[600] text-content">
              EasyPaisa
            </span>
          </button>
          {select === 'easypaisa' && (
            <div className="pt-4">
              <button
                onClick={() => walletHandler('easypaisa')}
                className="w-full h-[45px] rounded-md text-white font-[600] bg-[#00A651]"
              >
                {amountLabel}
              </button>
            </div>
          )}
        </div>
      )}

      {options.includes('jazzcash') && (
        <div>
          <button
            type="button"
            className="flex w-full items-center pb-4 border-b border-border"
            onClick={() => setSelect('jazzcash')}
          >
            <RadioDot active={select === 'jazzcash'} />
            <span className="text-[17px] pl-3 font-[600] text-content">
              JazzCash
            </span>
          </button>
          {select === 'jazzcash' && (
            <div className="pt-4">
              <button
                onClick={() => walletHandler('jazzcash')}
                className="w-full h-[45px] rounded-md text-white font-[600] bg-[#F15A29]"
              >
                {amountLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value, accent }) => (
  <div className="flex justify-between py-1">
    <span className={`text-[15px] ${accent ? accent : 'text-muted'}`}>{label}</span>
    <span className={`text-[15px] font-[600] ${accent ? accent : 'text-content'}`}>
      {value}
    </span>
  </div>
);

const CartData = ({
  orderData,
  method,
  advancePercent,
  advanceAmount,
  remainingAmount,
  amountDueNow,
}) => (
  <div className="w-full bg-surface border border-border rounded-md p-5">
    <Row label="Subtotal" value={`Rs. ${orderData?.subTotalPrice ?? '-'}`} />
    <Row
      label="Shipping"
      value={`Rs. ${Number(orderData?.shipping || 0).toFixed(2)}`}
    />
    <Row
      label="Discount"
      value={orderData?.discountPrice ? `Rs. ${orderData.discountPrice}` : '-'}
    />
    <div className="border-t border-border my-2" />
    <Row label="Total" value={`Rs. ${orderData?.totalPrice}`} />
    <div className="border-t border-border my-2" />
    <Row
      label="Payment method"
      value={METHOD_LABEL[method] || method}
    />
    {method === 'partial_advance' && (
      <>
        <Row
          label={`Pay now (${advancePercent}%)`}
          value={`Rs. ${advanceAmount}`}
          accent="text-green-600"
        />
        <Row
          label="Pay on delivery"
          value={`Rs. ${remainingAmount}`}
          accent="text-red-500"
        />
      </>
    )}
    {method === 'online_full' && (
      <Row label="Pay now" value={`Rs. ${amountDueNow}`} accent="text-green-600" />
    )}
    {method === 'cod' && (
      <Row
        label="Pay on delivery"
        value={`Rs. ${remainingAmount}`}
        accent="text-red-500"
      />
    )}
  </div>
);

export default Payment;
