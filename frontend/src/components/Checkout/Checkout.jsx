import React, { useEffect, useState } from 'react';
import styles from '../../styles/styles';
import { Country, State } from 'country-state-city';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { server } from '../../server';
import { toast } from 'react-toastify';
import { FiMapPin, FiTag, FiCreditCard } from 'react-icons/fi';
import { effectivePolicy, availableMethods } from '../../utils/paymentPolicy';

const Checkout = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);

  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [userInfo, setUserInfo] = useState(false);

  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [couponCodeData, setCouponCodeData] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(null);

  const [paymentSettings, setPaymentSettings] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    axios
      .get(`${server}/payment/config`)
      .then((res) => setPaymentSettings(res.data.paymentSettings))
      .catch(() => setPaymentSettings(null));
  }, []);

  const policy = effectivePolicy(paymentSettings, cart);
  const methods = availableMethods(policy);

  useEffect(() => {
    if (methods.length && !methods.find((m) => m.key === paymentMethod)) {
      setPaymentMethod(methods[0].key);
    }
  }, [methods, paymentMethod]);

  const subTotalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  // this is shipping cost variable
  const shipping = subTotalPrice * 0.1; // 10%
  //const shipping = subTotalPrice > 100 ? 0 : 10;

  const discountPercentage = couponCodeData ? discountPrice : 0;

  const totalPrice = (subTotalPrice + shipping - discountPercentage).toFixed(2);

  const paymentSubmit = () => {
    if (!address1 || !address2 || !zipCode || !country || !city) {
      toast.error('Please fill shipping address!');
      return;
    }
    if (!paymentMethod) {
      toast.error('Please choose a payment method!');
      return;
    }

    const shippingAddress = {
      address1,
      address2,
      zipCode,
      country,
      city,
    };

    const orderData = {
      cart,
      totalPrice,
      subTotalPrice,
      shipping,
      discountPrice,
      shippingAddress,
      user,
      paymentMethod,
      advancePercent: policy.advancePercent,
    };

    localStorage.setItem('latestOrder', JSON.stringify(orderData));

    navigate('/payment');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const name = couponCode;

      const res = await axios.get(`${server}/coupon/get-coupon-value/${name}`);

      const shopId = res.data.couponCode?.shopId;
      const couponValue = res.data.couponCode?.value;

      if (!res.data.couponCode) {
        toast.error("Coupon doesn't exist!");
        return;
      }

      const validProducts =
        cart && cart.filter((item) => item.shopId === shopId);

      if (validProducts.length === 0) {
        toast.error('Coupon not valid for this shop');
        return;
      }

      const eligibleAmount = validProducts.reduce(
        (acc, item) => acc + item.qty * item.discountPrice,
        0
      );

      const discount = (eligibleAmount * couponValue) / 100;

      setDiscountPrice(discount);
      setCouponCodeData(res.data.couponCode);

      toast.success('Coupon applied successfully!');
      setCouponCode('');
    } catch (error) {
      toast.error('Invalid coupon code');
    }
  };

  return (
    <div className='bg-[#f5f5f5] min-h-screen py-6'>
      <div className='max-w-7xl mx-auto px-3 lg:px-5'>
        <div className='flex flex-col lg:flex-row gap-5'>
          {/* LEFT */}
          <div className='w-full lg:w-[68%] space-y-5'>
            <ShippingInfo
              user={user}
              country={country}
              setCountry={setCountry}
              city={city}
              setCity={setCity}
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              address1={address1}
              setAddress1={setAddress1}
              address2={address2}
              setAddress2={setAddress2}
              zipCode={zipCode}
              setZipCode={setZipCode}
            />
            <PaymentMethodPicker
              methods={methods}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              policy={policy}
              totalPrice={totalPrice}
            />
          </div>

          {/* RIGHT */}
          <div className='w-full lg:w-[32%]'>
            <CartData
              handleSubmit={handleSubmit}
              totalPrice={totalPrice}
              shipping={shipping}
              subTotalPrice={subTotalPrice}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              discountPercentage={discountPercentage}
              paymentSubmit={paymentSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ShippingInfo = ({
  user,
  country,
  setCountry,
  city,
  setCity,
  userInfo,
  setUserInfo,
  address1,
  setAddress1,
  address2,
  setAddress2,
  zipCode,
  setZipCode,
}) => {
  return (
    <div className='bg-white rounded-md shadow-sm p-5'>
      <div className='flex items-center gap-2 border-b pb-4 mb-5'>
        <FiMapPin
          className='text-orange-500'
          size={22}
        />
        <h2 className='text-[20px] font-semibold text-gray-800'>
          Shipping Address
        </h2>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium text-gray-700'>Full Name</label>

          <input
            type='text'
            value={user?.name}
            disabled
            className='mt-1 w-full border rounded-md h-[45px] px-3 bg-gray-50'
          />
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>Email</label>

          <input
            type='email'
            value={user?.email}
            disabled
            className='mt-1 w-full border rounded-md h-[45px] px-3 bg-gray-50'
          />
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>
            Phone Number
          </label>

          <input
            type='number'
            value={user?.phoneNumber}
            disabled
            className='mt-1 w-full border rounded-md h-[45px] px-3 bg-gray-50'
          />
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>Zip Code</label>

          <input
            type='number'
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className='mt-1 w-full border rounded-md h-[45px] px-3 outline-none focus:border-orange-500'
          />
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>Country</label>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className='mt-1 w-full border rounded-md h-[45px] px-3 outline-none focus:border-orange-500'
          >
            <option value=''>Choose Country</option>

            {Country.getAllCountries().map((item) => (
              <option
                key={item.isoCode}
                value={item.isoCode}
              >
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>
            State / City
          </label>

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className='mt-1 w-full border rounded-md h-[45px] px-3 outline-none focus:border-orange-500'
          >
            <option value=''>Choose City</option>

            {State.getStatesOfCountry(country).map((item) => (
              <option
                key={item.isoCode}
                value={item.isoCode}
              >
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>
            Address Line 1
          </label>

          <input
            type='text'
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            className='mt-1 w-full border rounded-md h-[45px] px-3 outline-none focus:border-orange-500'
          />
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>
            Address Line 2
          </label>

          <input
            type='text'
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            className='mt-1 w-full border rounded-md h-[45px] px-3 outline-none focus:border-orange-500'
          />
        </div>
      </div>

      {/* SAVED ADDRESS */}
      {user?.addresses?.length > 0 && (
        <div className='mt-6'>
          <button
            onClick={() => setUserInfo(!userInfo)}
            className='text-orange-500 font-semibold'
          >
            {userInfo ? 'Hide Saved Addresses' : 'Choose Saved Address'}
          </button>

          {userInfo && (
            <div className='mt-4 space-y-3'>
              {user.addresses.map((item, index) => (
                <div
                  key={index}
                  className='border rounded-md p-3 flex items-start gap-3 hover:border-orange-500 cursor-pointer'
                >
                  <input
                    type='radio'
                    name='address'
                    onClick={() => {
                      setAddress1(item.address1);
                      setAddress2(item.address2);
                      setZipCode(item.zipCode);
                      setCountry(item.country);
                      setCity(item.city);
                    }}
                  />

                  <div>
                    <h4 className='font-semibold'>{item.addressType}</h4>

                    <p className='text-sm text-gray-500'>
                      {item.address1}, {item.address2}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CartData = ({
  handleSubmit,
  totalPrice,
  shipping,
  subTotalPrice,
  couponCode,
  setCouponCode,
  discountPercentage,
  paymentSubmit,
}) => {
  return (
    <div className='bg-white rounded-md shadow-sm p-5 sticky top-24'>
      <h2 className='text-[20px] font-semibold border-b pb-4 mb-5'>
        Order Summary
      </h2>

      <div className='space-y-4'>
        <div className='flex justify-between'>
          <span className='text-gray-600'>Subtotal</span>
          <span className='font-semibold'>${subTotalPrice.toFixed(2)}</span>
        </div>

        <div className='flex justify-between'>
          <span className='text-gray-600'>Shipping Fee</span>
          <span className='font-semibold'>${shipping.toFixed(2)}</span>
        </div>

        <div className='flex justify-between border-b pb-4'>
          <span className='text-gray-600'>Discount</span>
          <span className='font-semibold text-green-600'>
            -$
            {discountPercentage ? discountPercentage.toFixed(2) : '0.00'}
          </span>
        </div>

        <div className='flex justify-between text-lg font-bold'>
          <span>Total</span>
          <span className='text-orange-500'>${totalPrice}</span>
        </div>
      </div>

      {/* COUPON */}
      <form
        onSubmit={handleSubmit}
        className='mt-6'
      >
        <div className='flex'>
          <div className='relative flex-1'>
            <FiTag className='absolute left-3 top-3.5 text-gray-400' />

            <input
              type='text'
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder='Coupon code'
              className='w-full border h-[45px] pl-10 pr-3 rounded-l-md outline-none focus:border-orange-500'
            />
          </div>

          <button
            type='submit'
            className='bg-orange-500 text-white px-5 rounded-r-md hover:bg-orange-600'
          >
            Apply
          </button>
        </div>
      </form>

      {/* PAYMENT BUTTON */}
      <button
        onClick={paymentSubmit}
        className='w-full h-[48px] bg-orange-500 hover:bg-orange-600 transition text-white rounded-md font-semibold mt-6'
      >
        Proceed to Payment
      </button>
    </div>
  );
};

const PaymentMethodPicker = ({
  methods,
  paymentMethod,
  setPaymentMethod,
  policy,
  totalPrice,
}) => {
  const advance = Math.round((Number(totalPrice) * policy.advancePercent) / 100);

  const describe = (key) => {
    if (key === 'cod') return 'Pay the full amount in cash when your order arrives.';
    if (key === 'online_full') return 'Pay the full amount now via card or wallet.';
    if (key === 'partial_advance')
      return `Pay ${policy.advancePercent}% (Rs. ${advance}) now, the rest on delivery.`;
    return '';
  };

  return (
    <div className='bg-white rounded-md shadow-sm p-5'>
      <div className='flex items-center gap-2 border-b pb-4 mb-4'>
        <FiCreditCard className='text-orange-500' size={20} />
        <h2 className='text-[20px] font-semibold text-gray-800'>Payment Method</h2>
      </div>

      {methods.length === 0 ? (
        <p className='text-sm text-gray-500'>
          No payment method is available for the items in your cart. Please
          contact the store.
        </p>
      ) : (
        <div className='space-y-3'>
          {methods.map((m) => (
            <label
              key={m.key}
              className={`flex items-start gap-3 border rounded-md p-3 cursor-pointer transition ${
                paymentMethod === m.key
                  ? 'border-orange-500 bg-orange-50'
                  : 'hover:border-orange-300'
              }`}
            >
              <input
                type='radio'
                name='paymentMethod'
                className='mt-1'
                checked={paymentMethod === m.key}
                onChange={() => setPaymentMethod(m.key)}
              />
              <div>
                <div className='font-medium text-gray-800'>{m.label}</div>
                <div className='text-sm text-gray-500'>{describe(m.key)}</div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default Checkout;
