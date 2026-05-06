import React, { useEffect } from 'react';
import { backend_url } from '../../server';
import CountDown from './CountDown';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addTocart } from '../../redux/actions/cart';
import { toast } from 'react-toastify';

const EventCard = ({ data }) => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const addToCartHandler = () => {
    const exists = cart?.some((i) => i._id === data._id);

    if (exists) return toast.error('Already in cart');
    if (data.stock < 1) return toast.error('Out of stock');

    dispatch(addTocart({ ...data, qty: 1 }));
    toast.success('Added to cart');
  };

  return (
    <div className='w-full bg-white rounded-md shadow-sm hover:shadow-md transition p-4 flex flex-col lg:flex-row gap-6'>
      {/* LEFT IMAGE */}
      <div className='relative lg:w-[45%] flex justify-center items-center'>
        {/* 🔥 Badge */}
        <span className='absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded'>
          🔥 Deal
        </span>

        <img
          src={`${backend_url}${data.images?.[0]}`}
          alt='event'
          className='w-full h-[220px] sm:h-[300px] object-contain'
        />
      </div>

      {/* RIGHT CONTENT */}
      <div className='lg:w-[55%] flex flex-col justify-between'>
        {/* TITLE */}
        <div>
          <h2 className='text-lg sm:text-2xl font-semibold text-gray-800'>
            {data.name}
          </h2>

          {/* DESCRIPTION */}
          <p className='text-gray-500 mt-2 text-sm sm:text-base line-clamp-3'>
            {data.description}
          </p>
        </div>

        {/* PRICE SECTION */}
        <div className='mt-4'>
          <div className='flex items-center gap-3 flex-wrap'>
            <span className='text-gray-400 line-through text-sm'>
              {data.originalPrice}$
            </span>

            <span className='text-2xl font-bold text-orange-600'>
              {data.discountPrice}$
            </span>

            {/* Discount % */}
            <span className='text-green-600 text-sm font-medium'>
              {Math.round(
                ((data.originalPrice - data.discountPrice) /
                  data.originalPrice) *
                  100
              )}
              % OFF
            </span>
          </div>

          <p className='text-sm text-green-600 mt-1'>{data.sold_out} sold</p>
        </div>

        {/* COUNTDOWN */}
        <div className='mt-3 bg-gray-50 p-3 rounded'>
          <CountDown data={data} />
        </div>

        {/* BUTTONS */}
        <div className='mt-5 flex flex-col sm:flex-row gap-3'>
          {/* DETAILS */}
          <Link
            to={`/product/${data._id}?isEvent=true`}
            className='w-full sm:w-auto'
          >
            <button className='w-full sm:px-6 py-3 border border-orange-500 text-orange-500 rounded hover:bg-orange-50 transition'>
              See Details
            </button>
          </Link>

          {/* ADD TO CART */}
          <button
            onClick={addToCartHandler}
            className='w-full sm:px-6 py-3 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600 transition'
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
