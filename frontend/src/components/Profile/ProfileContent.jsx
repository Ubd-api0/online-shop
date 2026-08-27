import React, { useEffect, useState } from 'react';
import { backend_url, server } from '../../server';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteUserAddress,
  loadUser,
  updatUserAddress,
  updateUserInformation,
} from '../../redux/actions/user';
import {
  AiOutlineArrowRight,
  AiOutlineCamera,
  AiOutlineDelete,
} from 'react-icons/ai';
import { Link } from 'react-router-dom';
import styles from '../../styles/styles';
import { DataGrid } from '@material-ui/data-grid';
import { Button, Drawer } from '@material-ui/core';
import { RxCross1 } from 'react-icons/rx';
import { MdTrackChanges } from 'react-icons/md';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Country, State } from 'country-state-city';
import { getAllOrdersOfUser } from '../../redux/actions/order';
import Cloudinary from '../../cloudinary';

const ProfileContent = ({ active }) => {
  const { user, error, successMessage } = useSelector((state) => state.user);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch({ type: 'clearErrors' });
    }

    if (successMessage) {
      toast.success(successMessage);
      dispatch({ type: 'clearMessages' });
    }
  }, [error, successMessage, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(updateUserInformation(name, email, phoneNumber, password));
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const imageUrl = await Cloudinary.upload(file, 'avatars');

      await axios.put(
        `${server}/user/update-avatar`,
        {
          image: imageUrl,
        },
        {
          withCredentials: true,
        }
      );

      dispatch(loadUser());

      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className='w-full'>
      {/* PROFILE */}
      {active === 1 && (
        <div className='bg-surface rounded-md p-5 shadow-sm'>
          <div className='flex justify-center'>
            <div className='relative'>
              <img
                src={`${backend_url}${user?.avatar}`}
                alt='avatar'
                className='w-[140px] h-[140px] rounded-full object-cover border-4 border-green-500'
              />

              <label
                htmlFor='avatar'
                className='absolute bottom-1 right-1 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer'
              >
                <AiOutlineCamera size={20} />
              </label>

              <input
                type='file'
                id='avatar'
                className='hidden'
                onChange={handleImage}
              />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className='mt-8'
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block mb-2'>Full Name</label>

                <input
                  type='text'
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className='block mb-2'>Email</label>

                <input
                  type='email'
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className='block mb-2'>Phone Number</label>

                <input
                  type='number'
                  className={styles.input}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div>
                <label className='block mb-2'>Password</label>

                <input
                  type='password'
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type='submit'
              className='mt-6 w-[220px] h-[42px] border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition'
            >
              Update Profile
            </button>
          </form>
        </div>
      )}

      {/* ORDERS */}
      {active === 2 && <AllOrders />}

      {/* REFUND */}
      {active === 3 && <AllRefundOrders />}

      {/* TRACK */}
      {active === 5 && <TrackOrder />}

      {/* PASSWORD */}
      {active === 6 && <ChangePassword />}

      {/* ADDRESS */}
      {active === 7 && <Address />}
    </div>
  );
};

/* ========================================================= */
/* ORDERS */
/* ========================================================= */

const OrderTable = ({ rows, track = false }) => {
  const columns = [
    {
      field: 'id',
      headerName: 'Order ID',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.7,
      minWidth: 130,
    },
    {
      field: 'itemsQty',
      headerName: 'Items',
      flex: 0.5,
      minWidth: 100,
    },
    {
      field: 'total',
      headerName: 'Total',
      flex: 0.6,
      minWidth: 120,
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <Link
          to={
            track
              ? `/user/track/order/${params.row.id}`
              : `/user/order/${params.row.id}`
          }
        >
          <Button>
            {track ? (
              <MdTrackChanges size={20} />
            ) : (
              <AiOutlineArrowRight size={20} />
            )}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className='bg-surface border border-border p-4 rounded-md overflow-x-auto'>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        autoHeight
        disableSelectionOnClick
      />
    </div>
  );
};

const AllOrders = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user?._id));
  }, [dispatch, user]);

  const rows =
    orders?.map((item) => ({
      id: item._id,
      status: item.status,
      itemsQty: item.cart.length,
      total: `US$ ${item.totalPrice}`,
    })) || [];

  return <OrderTable rows={rows} />;
};

const AllRefundOrders = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user?._id));
  }, [dispatch, user]);

  const rows =
    orders
      ?.filter((item) => item.status === 'Processing refund')
      .map((item) => ({
        id: item._id,
        status: item.status,
        itemsQty: item.cart.length,
        total: `US$ ${item.totalPrice}`,
      })) || [];

  return <OrderTable rows={rows} />;
};

const TrackOrder = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user?._id));
  }, [dispatch, user]);

  const rows =
    orders?.map((item) => ({
      id: item._id,
      status: item.status,
      itemsQty: item.cart.length,
      total: `US$ ${item.totalPrice}`,
    })) || [];

  return (
    <OrderTable
      rows={rows}
      track={true}
    />
  );
};

/* ========================================================= */
/* CHANGE PASSWORD */
/* ========================================================= */

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordChangeHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        `${server}/user/update-user-password`,
        {
          oldPassword,
          newPassword,
          confirmPassword,
        },
        {
          withCredentials: true,
        }
      );

      toast.success(res?.data?.message || 'Password updated');

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className='bg-surface rounded-md p-5 shadow-sm'>
      <h2 className='text-2xl font-semibold text-center mb-6'>
        Change Password
      </h2>

      <form
        onSubmit={passwordChangeHandler}
        className='max-w-xl mx-auto'
      >
        <div className='mb-4'>
          <label className='block mb-2'>Old Password</label>

          <input
            type='password'
            className={styles.input}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>

        <div className='mb-4'>
          <label className='block mb-2'>New Password</label>

          <input
            type='password'
            className={styles.input}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className='mb-4'>
          <label className='block mb-2'>Confirm Password</label>

          <input
            type='password'
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type='submit'
          className='w-full h-[42px] border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition'
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

/* ========================================================= */
/* ADDRESS */
/* ========================================================= */

const Address = () => {
  const [open, setOpen] = useState(false);

  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [addressType, setAddressType] = useState('');

  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!country || !city || !address1 || !zipCode || !addressType) {
      return toast.error('Please fill all fields');
    }

    dispatch(
      updatUserAddress(country, city, address1, address2, zipCode, addressType)
    );

    setOpen(false);

    setCountry('');
    setCity('');
    setZipCode('');
    setAddress1('');
    setAddress2('');
    setAddressType('');
  };

  const handleDelete = (item) => {
    dispatch(deleteUserAddress(item._id));
  };

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-5'>
        <h2 className='text-2xl font-semibold'>My Addresses</h2>

        <button
          onClick={() => setOpen(true)}
          className={`${styles.button} rounded-md px-5 text-white`}
        >
          Add New
        </button>
      </div>

      {/* ADDRESS LIST */}

      <div className='space-y-4'>
        {user?.addresses?.map((item, index) => (
          <div
            key={index}
            className='bg-surface rounded-md p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4'
          >
            <div>
              <h4 className='font-semibold'>{item.addressType}</h4>

              <p className='text-sm text-gray-600'>
                {item.address1} {item.address2}
              </p>

              <p className='text-sm text-gray-600'>{user?.phoneNumber}</p>
            </div>

            <AiOutlineDelete
              size={22}
              className='cursor-pointer text-red-500'
              onClick={() => handleDelete(item)}
            />
          </div>
        ))}
      </div>

      {user?.addresses?.length === 0 && (
        <p className='text-center mt-10 text-gray-500'>No saved addresses</p>
      )}

      {/* DRAWER */}

      <Drawer
        anchor='right'
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className='w-[350px] sm:w-[420px] p-5'>
          <div className='flex justify-between items-center mb-5'>
            <h2 className='text-2xl font-semibold'>Add Address</h2>

            <RxCross1
              size={25}
              className='cursor-pointer'
              onClick={() => setOpen(false)}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label className='block mb-2'>Country</label>

              <select
                className={`${styles.input}`}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value=''>Select Country</option>

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

            <div className='mb-4'>
              <label className='block mb-2'>State</label>

              <select
                className={`${styles.input}`}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value=''>Select State</option>

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

            <div className='mb-4'>
              <label className='block mb-2'>Address 1</label>

              <input
                type='text'
                className={styles.input}
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
              />
            </div>

            <div className='mb-4'>
              <label className='block mb-2'>Address 2</label>

              <input
                type='text'
                className={styles.input}
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
              />
            </div>

            <div className='mb-4'>
              <label className='block mb-2'>Zip Code</label>

              <input
                type='number'
                className={styles.input}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
            </div>

            <div className='mb-5'>
              <label className='block mb-2'>Address Type</label>

              <select
                className={styles.input}
                value={addressType}
                onChange={(e) => setAddressType(e.target.value)}
              >
                <option value=''>Select Type</option>

                <option value='Home'>Home</option>

                <option value='Office'>Office</option>

                <option value='Default'>Default</option>
              </select>
            </div>

            <button
              type='submit'
              className='w-full h-[42px] bg-blue-600 text-white rounded-md'
            >
              Save Address
            </button>
          </form>
        </div>
      </Drawer>
    </div>
  );
};

export default ProfileContent;
