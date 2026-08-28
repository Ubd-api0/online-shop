import React from "react";
import { Link } from "react-router-dom";
import Lottie from "react-lottie";
import Layout from "../components/Layout/Layout";
import animationData from "../Assests/animations/107043-success.json";

const OrderSuccessPage = () => (
  <Layout>
    <Success />
  </Layout>
);

const Success = () => {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Lottie options={defaultOptions} width={280} height={280} />
      <h1 className="mt-4 text-2xl font-semibold text-content">
        Your order was placed successfully 🎉
      </h1>
      <p className="mt-2 text-muted">
        You can track it any time from your profile.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/profile"
          className="h-[42px] px-5 rounded-md bg-orange-500 text-white font-semibold flex items-center"
        >
          View orders
        </Link>
        <Link
          to="/products"
          className="h-[42px] px-5 rounded-md border border-border text-content font-semibold flex items-center"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
