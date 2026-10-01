"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfUser } from "@/redux/slices/order";
import { OrderTable } from "@/components/profile/order-table";
import { CANCELLED, REFUND_STAGES } from "@/lib/orders/status";

export function ProfileOrders() {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user]);

  return <OrderTable orders={orders} />;
}

export function ProfileRefunds() {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user]);

  const refundOrders = orders && orders.filter((item) => REFUND_STAGES.includes(item.status));
  return <OrderTable orders={refundOrders} emptyText="No refund requests." />;
}

export function ProfileTrackOrders() {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?._id) dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user]);

  // Only orders still on their way.
  const active = orders && orders.filter((o) => ![CANCELLED, "Delivered", ...REFUND_STAGES].includes(o.status));
  return <OrderTable orders={active} emptyText="No orders on the way right now." />;
}
