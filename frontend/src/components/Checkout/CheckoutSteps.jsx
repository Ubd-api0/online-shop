import React from 'react';
import {
  AiOutlineCheck,
  AiOutlineEnvironment,
  AiOutlineCreditCard,
} from 'react-icons/ai';
import { BsBagCheck } from 'react-icons/bs';

const CheckoutSteps = ({ active }) => {
  const steps = [
    {
      id: 1,
      title: 'Shipping',
      icon: <AiOutlineEnvironment size={18} />,
    },
    {
      id: 2,
      title: 'Payment',
      icon: <AiOutlineCreditCard size={18} />,
    },
    {
      id: 3,
      title: 'Success',
      icon: <BsBagCheck size={18} />,
    },
  ];

  return (
    <div className='w-full flex justify-center py-5 px-3'>
      <div className='w-full max-w-4xl flex items-center justify-between'>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* STEP */}
            <div className='flex flex-col items-center relative z-10'>
              {/* CIRCLE */}
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  active >= step.id
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-surface border-gray-300 text-gray-400'
                }`}
              >
                {active > step.id ? <AiOutlineCheck size={20} /> : step.icon}
              </div>

              {/* TITLE */}
              <span
                className={`mt-2 text-xs sm:text-sm font-medium text-center ${
                  active >= step.id ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                {step.title}
              </span>
            </div>

            {/* LINE */}
            {index !== steps.length - 1 && (
              <div
                className={`flex-1 h-[3px] mx-2 sm:mx-4 rounded-full transition-all duration-300 ${
                  active > step.id ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CheckoutSteps;
