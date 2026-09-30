import Image from "next/image";

export function ShopInfo({ shop, productsCount, averageRating }) {
  return (
    <div>
      <div className="w-full py-5">
        <div className="flex w-full items-center justify-center">
          <div className="relative size-[150px] overflow-hidden rounded-full bg-surface-alt">
            {shop?.avatar && <Image src={shop.avatar} alt="" fill className="object-cover" />}
          </div>
        </div>
        <h3 className="py-2 text-center text-[20px] text-content">{shop?.name}</h3>
        <p className="flex items-center p-[10px] text-[16px] text-muted">{shop?.description}</p>
      </div>
      <div className="p-3">
        <h5 className="font-semibold text-content">Address</h5>
        <h4 className="text-muted">{shop?.address}</h4>
      </div>
      <div className="p-3">
        <h5 className="font-semibold text-content">Phone Number</h5>
        <h4 className="text-muted">{shop?.phoneNumber}</h4>
      </div>
      <div className="p-3">
        <h5 className="font-semibold text-content">Total Products</h5>
        <h4 className="text-muted">{productsCount}</h4>
      </div>
      <div className="p-3">
        <h5 className="font-semibold text-content">Shop Ratings</h5>
        <h4 className="text-muted">{averageRating}/5</h4>
      </div>
      <div className="p-3">
        <h5 className="font-semibold text-content">Joined On</h5>
        <h4 className="text-muted">{shop?.createdAt?.slice(0, 10)}</h4>
      </div>
    </div>
  );
}
