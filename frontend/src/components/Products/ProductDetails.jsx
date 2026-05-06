import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../../styles/styles';
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShoppingCart,
} from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { backend_url, server } from '../../server';
import {
  addToWishlist,
  removeFromWishlist,
} from '../../redux/actions/wishlist';
import { addTocart } from '../../redux/actions/cart';
import { toast } from 'react-toastify';
import Ratings from './Ratings';
import axios from 'axios';

const ProductDetails = ({ data }) => {
  const { products } = useSelector((state) => state.products);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const totalReviewsLength =
    products &&
    products.reduce((acc, product) => acc + product.reviews.length, 0);

  const totalRatings =
    products &&
    products.reduce(
      (acc, product) =>
        acc + product.reviews.reduce((sum, review) => sum + review.rating, 0),
      0
    );

  const avg = totalRatings / totalReviewsLength || 0;

  const averageRating = avg.toFixed(2);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [count, setCount] = useState(1);
  const [select, setSelect] = useState(0);
  const [click, setClick] = useState(false);

  useEffect(() => {
    setClick(wishlist?.some((i) => i._id === data?._id));
  }, [wishlist, data]);

  const addToCartHandler = () => {
    const exists = cart?.some((i) => i._id === data._id);

    if (exists) return toast.error('Already in cart');
    if (data.stock < 1) return toast.error('Out of stock');

    dispatch(addTocart({ ...data, qty: count }));
    toast.success('Added to cart');
  };

  const toggleWishlist = () => {
    setClick(!click);
    click ? dispatch(removeFromWishlist(data)) : dispatch(addToWishlist(data));
  };

  const handleMessageSubmit = async () => {
    if (!isAuthenticated) return toast.error('Login required');

    try {
      const res = await axios.post(
        `${server}/conversation/create-new-conversation`,
        {
          groupTitle: data._id + user._id,
          userId: user._id,
          sellerId: data.shop._id,
        }
      );

      navigate(`/inbox?${res.data.conversation._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  if (!data) return null;

  return (
    <div className='bg-white pb-5'>
      <div className='max-w-6xl mx-auto px-3 md:px-6 py-6'>
        {/* MAIN LAYOUT */}
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* LEFT: IMAGES */}
          <div className='lg:w-[45%]'>
            {/* Main Image */}
            <div className='border rounded-md p-2'>
              <img
                src={`${backend_url}${data.images?.[select]}`}
                className='w-full h-[280px] sm:h-[400px] object-contain'
                alt=''
              />
            </div>

            {/* Thumbnails */}
            <div className='flex gap-2 mt-3 overflow-x-auto'>
              {data.images?.map((img, i) => (
                <img
                  key={i}
                  src={`${backend_url}${img}`}
                  onClick={() => setSelect(i)}
                  className={`w-[70px] h-[70px] object-contain border cursor-pointer ${
                    select === i ? 'border-red-500' : ''
                  }`}
                  alt=''
                />
              ))}
            </div>
          </div>

          {/* RIGHT: DETAILS (DARAZ STYLE BUY BOX) */}
          <div className='lg:w-[55%] relative'>
            {/* Floating Wishlist */}
            <div className='absolute right-0 top-0'>
              {click ? (
                <AiFillHeart
                  size={26}
                  color='red'
                  className='cursor-pointer'
                  onClick={toggleWishlist}
                />
              ) : (
                <AiOutlineHeart
                  size={26}
                  className='cursor-pointer'
                  onClick={toggleWishlist}
                />
              )}
            </div>

            {/* Title */}
            <h1 className='text-lg md:text-2xl font-semibold'>{data.name}</h1>

            {/* Ratings */}
            <div className='mt-2'>
              <Ratings rating={data?.ratings} />
            </div>

            {/* Price Box */}
            <div className='mt-4 bg-gray-50 p-3 rounded-md'>
              <div className='flex items-center gap-3'>
                <span className='text-red-500 line-through'>
                  {data.originalPrice}$
                </span>
                <span className='text-2xl font-bold text-green-600'>
                  {data.discountPrice}$
                </span>
              </div>
              <p className='text-sm text-gray-500 mt-1'>{data.sold_out} sold</p>
            </div>

            {/* Description */}
            <p className='mt-4 text-gray-600 text-sm md:text-base'>
              {data.description}
            </p>

            {/* Quantity */}
            <div className='flex items-center gap-3 mt-5'>
              <button
                onClick={() => setCount(Math.max(1, count - 1))}
                className='px-3 py-1 bg-gray-200'
              >
                -
              </button>

              <span className='px-4'>{count}</span>

              <button
                onClick={() => setCount(count + 1)}
                className='px-3 py-1 bg-gray-200'
              >
                +
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <div className='mt-6 flex flex-col sm:flex-row gap-3'>
              <button
                onClick={addToCartHandler}
                className='flex-1 bg-orange-500 text-white py-3 rounded-md font-semibold'
              >
                Add to Cart
              </button>

              <button
                onClick={handleMessageSubmit}
                className='flex-1 bg-blue-600 text-white py-3 rounded-md font-semibold flex items-center justify-center'
              >
                Chat <AiOutlineMessage className='ml-2' />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductDetailsInfo
        data={data}
        products={products}
        totalReviewsLength={totalReviewsLength}
        averageRating={averageRating}
      />

      {/* 🔥 MOBILE STICKY BAR (DARAZ STYLE) */}
      <div className='fixed bottom-0 left-0 w-full bg-white shadow-lg flex lg:hidden'>
        <button
          onClick={toggleWishlist}
          className='w-1/5 py-3 flex justify-center'
        >
          {click ? (
            <AiFillHeart
              color='red'
              size={24}
            />
          ) : (
            <AiOutlineHeart size={24} />
          )}
        </button>

        <button
          onClick={addToCartHandler}
          className='w-2/5 bg-orange-500 text-white font-semibold'
        >
          Add to Cart
        </button>

        <button
          onClick={handleMessageSubmit}
          className='w-2/5 bg-blue-600 text-white font-semibold'
        >
          Chat
        </button>
      </div>
    </div>
  );
};

const ProductDetailsInfo = ({
  data,
  products,
  totalReviewsLength,
  averageRating,
}) => {
  const [active, setActive] = useState(1);

  if (!data) return null;

  return (
    <div className='bg-white border rounded-md px-3 md:px-8 py-4'>
      {/* 🔥 TABS (DARAZ STYLE) */}
      <div className='flex gap-6 border-b overflow-x-auto whitespace-nowrap'>
        <div
          className='relative pb-2 cursor-pointer'
          onClick={() => setActive(1)}
        >
          <h5 className='text-sm md:text-base font-semibold'>
            Product Details
          </h5>
          {active === 1 && (
            <div className='h-[2px] w-full bg-orange-500 absolute bottom-0 left-0' />
          )}
        </div>

        <div
          className='relative pb-2 cursor-pointer'
          onClick={() => setActive(2)}
        >
          <h5 className='text-sm md:text-base font-semibold'>
            Reviews ({data.reviews?.length})
          </h5>
          {active === 2 && (
            <div className='h-[2px] w-full bg-orange-500 absolute bottom-0 left-0' />
          )}
        </div>

        <div
          className='relative pb-2 cursor-pointer'
          onClick={() => setActive(3)}
        >
          <h5 className='text-sm md:text-base font-semibold'>Seller Info</h5>
          {active === 3 && (
            <div className='h-[2px] w-full bg-orange-500 absolute bottom-0 left-0' />
          )}
        </div>
      </div>

      {/* 📦 PRODUCT DETAILS */}
      {active === 1 && (
        <div className='py-4 text-gray-700 text-sm md:text-base leading-7 whitespace-pre-line'>
          {data.description}
        </div>
      )}

      {/* ⭐ REVIEWS */}
      {active === 2 && (
        <div className='py-4 space-y-4 max-h-[400px] overflow-y-auto'>
          {data?.reviews?.length > 0 ? (
            data.reviews.map((item, index) => (
              <div
                key={index}
                className='flex gap-3'
              >
                <img
                  src={`${backend_url}${item.user?.avatar}`}
                  className='w-10 h-10 rounded-full object-cover'
                  alt=''
                />

                <div>
                  <div className='flex items-center gap-2'>
                    <h4 className='font-medium text-sm'>{item.user?.name}</h4>

                    <Ratings rating={item.rating} />
                  </div>

                  <p className='text-sm text-gray-600'>{item.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <p className='text-gray-500 text-sm'>
              No reviews yet for this product.
            </p>
          )}
        </div>
      )}

      {/* 🏪 SELLER INFO (DARAZ STYLE CARD) */}
      {active === 3 && (
        <div className='py-5 flex flex-col md:flex-row justify-between gap-6'>
          {/* LEFT */}
          <div className='flex-1'>
            <Link to={`/shop/preview/${data.shop?._id}`}>
              <div className='flex items-center gap-3'>
                <img
                  src={`${backend_url}${data?.shop?.avatar}`}
                  className='w-12 h-12 rounded-full object-cover'
                  alt=''
                />

                <div>
                  <h3 className='font-semibold'>{data.shop?.name}</h3>

                  <p className='text-xs text-gray-500'>
                    ⭐ {averageRating}/5 Rating
                  </p>
                </div>
              </div>
            </Link>

            <p className='text-sm text-gray-600 mt-3'>
              {data.shop?.description}
            </p>
          </div>

          {/* RIGHT */}
          <div className='md:text-right flex flex-col gap-2'>
            <p className='text-sm'>
              Joined:{' '}
              <span className='font-medium'>
                {data.shop?.createdAt?.slice(0, 10)}
              </span>
            </p>

            <p className='text-sm'>
              Products: <span className='font-medium'>{products?.length}</span>
            </p>

            <p className='text-sm'>
              Reviews: <span className='font-medium'>{totalReviewsLength}</span>
            </p>

            {/* VISIT SHOP BUTTON */}
            <Link to={`/shop/preview/${data.shop?._id}`}>
              <button className='mt-3 bg-orange-500 text-white px-4 py-2 rounded-md text-sm'>
                Visit Shop
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
