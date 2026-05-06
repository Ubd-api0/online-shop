import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../../styles/styles';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToWishlist,
  removeFromWishlist,
} from '../../../redux/actions/wishlist';
import { addTocart } from '../../../redux/actions/cart';
import { backend_url } from '../../../server';
import { toast } from 'react-toastify';

const ProductCard = ({ data }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);

  const dispatch = useDispatch();
  const [click, setClick] = useState(false);

  useEffect(() => {
    setClick(wishlist?.some((i) => i._id === data._id));
  }, [wishlist, data]);

  // wishlist toggle
  const toggleWishlist = () => {
    setClick(!click);

    if (click) {
      dispatch(removeFromWishlist(data));
    } else {
      dispatch(addToWishlist(data));
    }
  };

  // cart
  const addToCartHandler = () => {
    const exists = cart?.find((i) => i._id === data._id);

    if (exists) return toast.error('Already in cart!');

    dispatch(addTocart({ ...data, qty: 1 }));
    toast.success('Added to cart!');
  };

  return (
    <div className='relative bg-white border rounded-md p-3 hover:shadow-md transition w-full'>
      {/* ❤️ FAVORITE BUTTON (DARAZ STYLE) */}
      <div
        onClick={toggleWishlist}
        className='absolute top-2 right-2 bg-white p-1 rounded-full shadow cursor-pointer z-10'
      >
        {click ? (
          <AiFillHeart
            size={20}
            color='red'
          />
        ) : (
          <AiOutlineHeart size={20} />
        )}
      </div>

      {/* PRODUCT IMAGE */}
      <Link to={`/product/${data._id}`}>
        <img
          src={`${backend_url}${data.images?.[0]}`}
          className='w-full h-[160px] object-contain'
          alt=''
        />
      </Link>

      {/* SHOP NAME */}
      <h5 className='text-xs text-gray-500 mt-1'>{data.shop.name}</h5>

      {/* TITLE */}
      <h4 className='text-sm font-medium line-clamp-2'>{data.name}</h4>

      {/* PRICE */}
      <div className='flex items-center gap-2 mt-1'>
        <span className='text-green-600 font-bold'>${data.discountPrice}</span>
        <span className='text-gray-400 line-through text-xs'>
          ${data.originalPrice}
        </span>
      </div>

      {/* ADD TO CART */}
      <button
        onClick={addToCartHandler}
        className='w-full mt-2 bg-orange-500 text-white py-1 rounded-md text-sm'
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
