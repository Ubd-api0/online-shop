"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfUser } from "@/redux/slices/order";
import { OrderTable } from "@/components/profile/order-table";

function toRows(orders) {
  return (orders || []).map((item) => ({
    id: item._id,
    status: item.status,
    itemsQty: item.cart.length,
    total: `US$ ${item.totalPrice}`,
  }));
}

export function ProfileOrders() {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user]);

  return <OrderTable rows={toRows(orders)} />;
}

export function ProfileRefunds() {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user]);

  const refundOrders = (orders || []).filter((item) => item.status === "Processing refund");
  return <OrderTable rows={toRows(refundOrders)} />;
}

export function ProfileTrackOrders() {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user]);

  return <OrderTable rows={toRows(orders)} track />;
}
