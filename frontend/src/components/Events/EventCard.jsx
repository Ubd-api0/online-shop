import React, { useEffect } from 'react';
import { backend_url } from '../../server';
import styles from '../../styles/styles';
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

    if (exists) {
      toast.error('Item already in cart!');
    } else if (data.stock < 1) {
      toast.error('Product stock limited!');
    } else {
      dispatch(addTocart({ ...data, qty: 1 }));
      toast.success('Item added successfully!');
    }
  };

  return (
    <div className='w-full bg-white rounded-lg shadow-sm p-3 lg:flex gap-5'>
      {/* Image */}
      <div className='w-full lg:w-1/2 flex justify-center items-center'>
        <img
          src={`${backend_url}${data.images?.[0]}`}
          alt='event'
          className='w-full max-h-[250px] sm:max-h-[300px] object-contain rounded-md'
        />
      </div>

      {/* Content */}
      <div className='w-full lg:w-1/2 flex flex-col justify-center mt-4 lg:mt-0'>
        {/* Title */}
        <h2 className={`${styles.productTitle} text-lg sm:text-xl`}>
          {data.name}
        </h2>

        {/* Description */}
        <p className='text-sm sm:text-base text-gray-600 mt-2 line-clamp-3'>
          {data.description}
        </p>

        {/* Price */}
        <div className='flex items-center justify-between mt-3 flex-wrap gap-2'>
          <div className='flex items-center gap-3'>
            <h5 className='text-red-500 line-through text-sm sm:text-base'>
              {data.originalPrice}$
            </h5>
            <h5 className='font-bold text-lg sm:text-xl text-gray-800'>
              {data.discountPrice}$
            </h5>
          </div>

          <span className='text-green-600 text-sm sm:text-base'>
            {data.sold_out} sold
          </span>
        </div>

        {/* Countdown */}
        <div className='mt-3'>
          <CountDown data={data} />
        </div>

        {/* Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 mt-4'>
          <Link
            to={`/product/${data._id}?isEvent=true`}
            className='w-full sm:w-auto'
          >
            <div className={`${styles.button} text-white w-full text-center`}>
              See Details
            </div>
          </Link>

          <div
            onClick={addToCartHandler}
            className={`${styles.button} text-white w-full sm:w-auto text-center cursor-pointer`}
          >
            Add to cart
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
