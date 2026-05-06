import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoBagHandleOutline } from 'react-icons/io5';
import { HiOutlineMinus, HiPlus } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { backend_url } from '../../server';
import { addTocart, removeFromCart } from '../../redux/actions/cart';
import {
  Drawer,
  IconButton,
  Typography,
  Box,
  Divider,
  Button,
} from '@material-ui/core';
import { RxCross1 } from 'react-icons/rx';

const Cart = ({ openCart, setOpenCart }) => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  const removeFromCartHandler = (data) => {
    dispatch(removeFromCart(data));
  };

  const quantityChangeHandler = (data) => {
    dispatch(addTocart(data));
  };

  return (
    <Drawer
      anchor='right'
      open={openCart}
      onClose={() => setOpenCart(false)}
      ModalProps={{
        keepMounted: true, // better mobile performance
      }}
      PaperProps={{
        sx: { width: { xs: '85%', sm: 350 } },
      }}
    >
      {/* HEADER */}
      <Box className='flex items-center justify-between p-4'>
        <Box className='flex items-center gap-2'>
          <IoBagHandleOutline size={22} />
          <Typography variant='h6'>{cart.length} Items</Typography>
        </Box>

        <IconButton onClick={() => setOpenCart(false)}>
          <RxCross1 />
        </IconButton>
      </Box>

      <Divider />

      {/* EMPTY */}
      {cart.length === 0 ? (
        <Box className='flex items-center justify-center h-full'>
          <Typography>Cart is empty</Typography>
        </Box>
      ) : (
        <>
          {/* ITEMS */}
          <Box className='flex-1 overflow-y-auto'>
            {cart.map((item, index) => (
              <CartItem
                key={index}
                data={item}
                quantityChangeHandler={quantityChangeHandler}
                removeFromCartHandler={removeFromCartHandler}
              />
            ))}
          </Box>

          {/* FOOTER */}
          <Box className='p-4 border-t'>
            <Link to='/checkout'>
              <Button
                fullWidth
                variant='contained'
                sx={{
                  backgroundColor: '#f85606',
                  '&:hover': { backgroundColor: '#d84315' },
                }}
              >
                Checkout (USD {totalPrice})
              </Button>
            </Link>
          </Box>
        </>
      )}
    </Drawer>
  );
};

const CartItem = ({ data, quantityChangeHandler, removeFromCartHandler }) => {
  const [value, setValue] = useState(data.qty);

  const increment = () => {
    if (data.stock <= value) {
      toast.error('Stock limited');
      return;
    }
    const updated = { ...data, qty: value + 1 };
    setValue(value + 1);
    quantityChangeHandler(updated);
  };

  const decrement = () => {
    if (value === 1) return;
    const updated = { ...data, qty: value - 1 };
    setValue(value - 1);
    quantityChangeHandler(updated);
  };

  const totalPrice = data.discountPrice * value;

  return (
    <Box className='flex gap-3 p-4 border-b items-center'>
      {/* Quantity */}
      <Box className='flex flex-col items-center gap-1'>
        <button
          onClick={increment}
          className='bg-orange-500 text-white w-6 h-6 flex items-center justify-center rounded'
        >
          <HiPlus size={14} />
        </button>

        <span>{value}</span>

        <button
          onClick={decrement}
          className='bg-gray-200 w-6 h-6 flex items-center justify-center rounded'
        >
          <HiOutlineMinus size={14} />
        </button>
      </Box>

      {/* Image */}
      <img
        src={`${backend_url}${data.images[0]}`}
        className='w-[70px] h-[70px] object-contain'
        alt=''
      />

      {/* Info */}
      <Box className='flex-1'>
        <Typography variant='body2'>{data.name}</Typography>
        <Typography variant='caption'>
          ${data.discountPrice} × {value}
        </Typography>
        <Typography
          color='error'
          fontWeight='bold'
        >
          ${totalPrice}
        </Typography>
      </Box>

      {/* Remove */}
      <IconButton onClick={() => removeFromCartHandler(data)}>
        <RxCross1 />
      </IconButton>
    </Box>
  );
};

export default Cart;
