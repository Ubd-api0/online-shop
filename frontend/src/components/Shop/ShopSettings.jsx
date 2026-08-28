import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { backend_url, server } from '../../server';
import { AiOutlineCamera } from 'react-icons/ai';
import styles from '../../styles/styles';
import axios from 'axios';
import { loadSeller } from '../../redux/actions/user';
import { toast } from 'react-toastify';
import Cloudinary from '../../cloudinary';

const ShopSettings = () => {
  const { seller } = useSelector((state) => state.seller);
  const [avatar, setAvatar] = useState();
  const [name, setName] = useState(seller && seller.name);
  const [description, setDescription] = useState(
    seller && seller.description ? seller.description : ''
  );
  const [address, setAddress] = useState(seller && seller.address);
  const [phoneNumber, setPhoneNumber] = useState(seller && seller.phoneNumber);
  const [zipCode, setZipcode] = useState(seller && seller.zipCode);

  const dispatch = useDispatch();

  // Image updated
  const _handleImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    setAvatar(file);

    const formData = new FormData();

    formData.append('image', e.target.files[0]);

    await axios
      .put(`${server}/shop/update-shop-avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      })
      .then((res) => {
        dispatch(loadSeller());
        toast.success('Avatar updated successfully!');
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    setAvatar(file);

    try {
      // 1. upload directly to Cloudinary
      const imageUrl = await Cloudinary.upload(file, 'shop-avatar');

      // 2. send only URL to backend
      await axios.put(
        `${server}/shop/update-shop-avatar`,
        {
          image: imageUrl,
        },
        {
          withCredentials: true,
        }
      );

      dispatch(loadSeller());
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error');
    }
  };

  const updateHandler = async (e) => {
    e.preventDefault();

    await axios
      .put(
        `${server}/shop/update-seller-info`,
        {
          name,
          address,
          zipCode,
          phoneNumber,
          description,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success('Shop info updated succesfully!');
        dispatch(loadSeller());
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  return (
    <div className='w-full min-h-screen flex flex-col items-center'>
      <div className='flex w-full 800px:w-[80%] flex-col justify-center my-5'>
        <div className='w-full flex items-center justify-center'>
          <div className='relative'>
            <img
              src={
                avatar
                  ? URL.createObjectURL(avatar)
                  : `${backend_url}/${seller.avatar}`
              }
              alt=''
              className='w-[200px] h-[200px] rounded-full cursor-pointer'
            />
            <div className='w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[10px] right-[15px]'>
              <input
                type='file'
                id='image'
                className='hidden'
                onChange={handleImage}
              />
              <label htmlFor='image'>
                <AiOutlineCamera />
              </label>
            </div>
          </div>
        </div>

        {/* shop info */}
        <form
          className='flex flex-col items-center'
          onSubmit={updateHandler}
        >
          <div className='w-[100%] flex items-center flex-col 800px:w-[50%] mt-5'>
            <div className='w-full pl-[3%]'>
              <label className='block pb-2'>Shop Name</label>
            </div>
            <input
              type='name'
              placeholder={`${seller.name}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>
          <div className='w-[100%] flex items-center flex-col 800px:w-[50%] mt-5'>
            <div className='w-full pl-[3%]'>
              <label className='block pb-2'>Shop description</label>
            </div>
            <input
              type='name'
              placeholder={`${
                seller?.description
                  ? seller.description
                  : 'Enter your shop description'
              }`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
            />
          </div>
          <div className='w-[100%] flex items-center flex-col 800px:w-[50%] mt-5'>
            <div className='w-full pl-[3%]'>
              <label className='block pb-2'>Shop Address</label>
            </div>
            <input
              type='name'
              placeholder={seller?.address}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className='w-[100%] flex items-center flex-col 800px:w-[50%] mt-5'>
            <div className='w-full pl-[3%]'>
              <label className='block pb-2'>Shop Phone Number</label>
            </div>
            <input
              type='number'
              placeholder={seller?.phoneNumber}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className='w-[100%] flex items-center flex-col 800px:w-[50%] mt-5'>
            <div className='w-full pl-[3%]'>
              <label className='block pb-2'>Shop Zip Code</label>
            </div>
            <input
              type='number'
              placeholder={seller?.zipCode}
              value={zipCode}
              onChange={(e) => setZipcode(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className='w-[100%] flex items-center flex-col 800px:w-[50%] mt-5'>
            <input
              type='submit'
              value='Update Shop'
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
              readOnly
            />
          </div>
        </form>

        <PaymentSettingsPanel seller={seller} onSaved={() => dispatch(loadSeller())} />
      </div>
    </div>
  );
};

const DEFAULT_PS = {
  codEnabled: true,
  onlineFullEnabled: true,
  partialAdvanceEnabled: false,
  advancePercent: 20,
  gateways: { stripe: true, paypal: true, easypaisa: false, jazzcash: false },
};

const PaymentSettingsPanel = ({ seller, onSaved }) => {
  const [ps, setPs] = useState({
    ...DEFAULT_PS,
    ...(seller?.paymentSettings || {}),
    gateways: {
      ...DEFAULT_PS.gateways,
      ...((seller?.paymentSettings && seller.paymentSettings.gateways) || {}),
    },
  });
  const [saving, setSaving] = useState(false);

  const setFlag = (k) => (e) => setPs((p) => ({ ...p, [k]: e.target.checked }));
  const setGw = (k) => (e) =>
    setPs((p) => ({ ...p, gateways: { ...p.gateways, [k]: e.target.checked } }));

  const save = async () => {
    if (!ps.codEnabled && !ps.onlineFullEnabled && !ps.partialAdvanceEnabled) {
      return toast.error('Enable at least one payment method');
    }
    setSaving(true);
    try {
      await axios.put(
        `${server}/shop/update-payment-settings`,
        { paymentSettings: { ...ps, advancePercent: Number(ps.advancePercent) } },
        { withCredentials: true }
      );
      toast.success('Payment settings updated!');
      onSaved && onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const Check = ({ label, checked, onChange, hint }) => (
    <label className="flex items-start gap-3 py-2 cursor-pointer">
      <input type="checkbox" className="mt-1" checked={!!checked} onChange={onChange} />
      <span>
        <span className="block text-content">{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
    </label>
  );

  return (
    <div className="w-full 800px:w-[70%] mx-auto mt-10 bg-surface border border-border rounded-md p-6">
      <h3 className="text-[18px] font-[600] text-content border-b border-border pb-3 mb-3">
        Payment Criteria
      </h3>
      <p className="text-sm text-muted mb-4">
        Choose how customers may pay. These options are shown at checkout; a
        product can further restrict them via its own override.
      </p>

      <Check
        label="Cash on Delivery"
        checked={ps.codEnabled}
        onChange={setFlag('codEnabled')}
        hint="Customer pays the full amount on delivery."
      />
      <Check
        label="Full online payment"
        checked={ps.onlineFullEnabled}
        onChange={setFlag('onlineFullEnabled')}
        hint="Customer pays the whole order online before dispatch."
      />
      <Check
        label="Partial advance"
        checked={ps.partialAdvanceEnabled}
        onChange={setFlag('partialAdvanceEnabled')}
        hint="Customer pays a percentage online now, the rest on delivery."
      />

      {ps.partialAdvanceEnabled && (
        <div className="flex items-center gap-3 py-2 pl-7">
          <label className="text-sm text-muted">Advance percentage</label>
          <input
            type="number"
            min={1}
            max={100}
            value={ps.advancePercent}
            onChange={(e) =>
              setPs((p) => ({ ...p, advancePercent: e.target.value }))
            }
            className="w-[90px] border border-border rounded px-2 py-1 bg-surface text-content"
          />
          <span className="text-sm text-muted">%</span>
        </div>
      )}

      <h4 className="text-[15px] font-[600] text-content mt-5 mb-1">
        Online gateways
      </h4>
      <div className="grid grid-cols-2 gap-x-6">
        <Check label="Stripe (card)" checked={ps.gateways.stripe} onChange={setGw('stripe')} />
        <Check label="PayPal" checked={ps.gateways.paypal} onChange={setGw('paypal')} />
        <Check label="EasyPaisa" checked={ps.gateways.easypaisa} onChange={setGw('easypaisa')} />
        <Check label="JazzCash" checked={ps.gateways.jazzcash} onChange={setGw('jazzcash')} />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-5 h-[42px] px-6 rounded-md bg-brand text-white font-[600] disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save payment settings'}
      </button>
    </div>
  );
};

export default ShopSettings;
