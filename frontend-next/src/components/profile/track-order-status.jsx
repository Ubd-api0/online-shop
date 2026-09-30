"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfUser } from "@/redux/slices/order";

const STATUS_MESSAGE = {
  Processing: "Your Order is processing in shop.",
  "Transferred to delivery partner": "Your Order is on the way for delivery partner.",
  Shipping: "Your Order is on the way with our delivery partner.",
  Received: "Your Order is in your city. Our Delivery man will deliver it.",
  "On the way": "Our Delivery man is going to deliver your order.",
  Delivered: "Your order is delivered!",
  "Processing refund": "Your refund is processing!",
  "Refund Success": "Your Refund is success!",
};

export function TrackOrderStatus({ orderId }) {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user]);

  const data = orders?.find((item) => item._id === orderId);
  const message = data?.status ? STATUS_MESSAGE[data.status] : null;

  return (
    <div className="flex h-[80vh] w-full items-center justify-center px-4 text-center">
      {message && <h1 className="text-xl text-content">{message}</h1>}
    </div>
  );
}
