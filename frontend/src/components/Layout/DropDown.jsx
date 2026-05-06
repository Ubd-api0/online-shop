import React from 'react';
import { useNavigate } from 'react-router-dom';

const DropDown = ({ categoriesData, setDropDown }) => {
  const navigate = useNavigate();

  const submitHandle = (i) => {
    navigate(`/products?category=${i.title}`);
    setDropDown(false);
    window.location.reload();
  };

  return (
    <div className='absolute left-0 mt-2 w-full sm:w-[260px] max-h-[350px] overflow-y-auto bg-white z-50 rounded-md shadow-lg border'>
      {categoriesData?.map((i, index) => (
        <div
          key={index}
          className='flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer'
          onClick={() => submitHandle(i)}
        >
          <img
            src={i.image_Url}
            className='w-6 h-6 object-contain'
            alt=''
          />
          <h3 className='text-sm text-gray-700'>{i.title}</h3>
        </div>
      ))}

      {categoriesData?.length === 0 && (
        <div className='p-3 text-sm text-gray-500'>No categories found</div>
      )}
    </div>
  );
};

export default DropDown;
