"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useDispatch, useSelector } from "react-redux";
import { completeCheckout } from "@/redux/slices/cart";
import { toast } from "sonner";
import { X } from "lucide-react";
import api from "@/lib/axios";
import { effectivePolicy } from "@/lib/paymentPolicy";
import { formatPrice } from "@/lib/format";
import { formatAddressLines } from "@/components/address/address-fields";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const METHOD_LABEL = {
  cod: "Cash on Delivery",
  online_full: "Full online payment",
  partial_advance: "Advance payment",
};

const stripeElementStyle =
  "flex h-11 w-full items-center rounded-DEFAULT border border-border bg-surface px-3 text-sm text-content";

export function PaymentForm({ initialConfig }) {
  const [orderData, setOrderData] = useState(null);
  const [config, setConfig] = useState(initialConfig || null);
  const [open, setOpen] = useState(false);

  const { user } = useSelector((state) => state.user);
  const router = useRouter();
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    setOrderData(JSON.parse(localStorage.getItem("latestOrder") || "null"));
    if (!initialConfig) {
      api
        .get("/payment/config")
        .then((res) => setConfig(res.data))
        .catch(() => setConfig({ gateways: {}, paymentSettings: null }));
    }
  }, [initialConfig]);

  const method = orderData?.paymentMethod || "cod";
  const policy = useMemo(
    () => effectivePolicy(config?.paymentSettings, orderData?.cart || []),
    [config, orderData]
  );

  const totalPrice = Number(orderData?.totalPrice || 0);
  const advancePercent = policy.advancePercent;
  const advanceAmount = method === "partial_advance" ? Math.round((totalPrice * advancePercent) / 100) : 0;
  const remainingAmount =
    method === "partial_advance"
      ? Math.round(totalPrice - advanceAmount)
      : method === "cod"
        ? Math.round(totalPrice)
        : 0;
  const amountDueNow = method === "online_full" ? totalPrice : method === "partial_advance" ? advanceAmount : 0;

  const orderRef = useMemo(() => `ORD-${Date.now()}`, []);

  const placeOrder = async (paymentInfo) => {
    const { data } = await api.post("/order/create-order", {
      items: orderData?.items || orderData?.cart,
      shippingAddress: orderData?.shippingAddress,
      deliveryOption: orderData?.deliveryOption,
      couponCode: orderData?.couponCode,
      paymentMethod: method,
      paymentInfo,
    });
    dispatch(completeCheckout(orderData));
    toast.success("Order placed successfully!");
    window.location.assign(`/order/success?id=${data.orders?.[0]?._id || ""}`);
  };

  const codHandler = async (e) => {
    e.preventDefault();
    try {
      await placeOrder({ type: "Cash On Delivery", status: "pending_cod" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order");
    }
  };

  const stripeHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/payment/process", {
        amount: Math.round(amountDueNow * 100),
      });
      if (!stripe || !elements) return;
      const result = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card: elements.getElement(CardNumberElement) },
      });
      if (result.error) return toast.error(result.error.message);
      if (result.paymentIntent.status === "succeeded") {
        await placeOrder({
          id: result.paymentIntent.id,
          status: method === "partial_advance" ? "advance_paid" : "succeeded",
          type: "Credit Card",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    }
  };

  const createPaypalOrder = (data, actions) =>
    actions.order
      .create({
        purchase_units: [
          {
            description: `Store order (${METHOD_LABEL[method]})`,
            amount: { currency_code: "USD", value: String(amountDueNow) },
          },
        ],
        application_context: { shipping_preference: "NO_SHIPPING" },
      })
      .then((id) => id);

  const onPaypalApprove = async (data, actions) =>
    actions.order.capture().then(async (details) => {
      if (!details?.payer) return;
      try {
        await placeOrder({
          id: details.payer.payer_id,
          status: method === "partial_advance" ? "advance_paid" : "succeeded",
          type: "Paypal",
        });
      } catch (err) {
        toast.error(err.response?.data?.message || "Payment failed");
      }
    });

  const walletHandler = async (gateway) => {
    try {
      const { data } = await api.post(`/payment/${gateway}/initiate`, {
        amount: amountDueNow,
        orderRef,
        customerEmail: user?.email,
        customerMobile: user?.phoneNumber,
      });

      if (data.mock && data.redirectUrl) {
        if (data.message) toast.info(data.message);
        window.location.href = data.redirectUrl;
        return;
      }

      if (gateway === "jazzcash" && data.paymentData) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.paymentUrl;
        Object.entries(data.paymentData).forEach(([k, v]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = v;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }

      window.location.href = data.redirectUrl || data.paymentUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    }
  };

  if (!orderData) {
    return (
      <div className="flex w-full justify-center py-16 text-content">
        No order in progress.{" "}
        <button onClick={() => router.push("/")} className="pl-2 text-brand underline">
          Continue shopping
        </button>
      </div>
    );
  }

  const gw = policy.gateways;

  return (
    <div className="flex w-full flex-col items-center px-3 py-8">
      <div className="flex w-full max-w-5xl flex-col gap-6 800px:flex-row">
        <div className="w-full 800px:w-[62%]">
          {method === "cod" ? (
            <Card variant="solid" className="p-6">
              <h4 className="mb-2 text-[18px] font-semibold text-content">Cash on Delivery</h4>
              <p className="mb-5 text-sm text-muted">
                You will pay {formatPrice(remainingAmount)} in cash when your order is delivered. No online
                payment is required now.
              </p>
              <Button onClick={codHandler} className="w-full">
                Place Order
              </Button>
            </Card>
          ) : (
            <PaymentGateways
              user={user}
              open={open}
              setOpen={setOpen}
              gateways={gw}
              paypalClientId={config?.paypalClientId}
              amountLabel={
                method === "partial_advance"
                  ? `Pay ${advancePercent}% advance (${formatPrice(advanceAmount)})`
                  : `Pay ${formatPrice(amountDueNow)}`
              }
              stripeHandler={stripeHandler}
              onApprove={onPaypalApprove}
              createOrder={createPaypalOrder}
              walletHandler={walletHandler}
            />
          )}
        </div>

        <div className="w-full 800px:w-[38%]">
          <OrderTotals
            orderData={orderData}
            method={method}
            advancePercent={advancePercent}
            advanceAmount={advanceAmount}
            remainingAmount={remainingAmount}
            amountDueNow={amountDueNow}
          />
        </div>
      </div>
    </div>
  );
}

function RadioDot({ active }) {
  return (
    <div className="flex size-[22px] shrink-0 items-center justify-center rounded-full border-[3px] border-muted">
      {active && <div className="size-[11px] rounded-full bg-brand" />}
    </div>
  );
}

function PaymentGateways({ user, open, setOpen, gateways, paypalClientId, amountLabel, stripeHandler, onApprove, createOrder, walletHandler }) {
  const options = [
    gateways.stripe && "card",
    gateways.paypal && paypalClientId && "paypal",
    gateways.easypaisa && "easypaisa",
    gateways.jazzcash && "jazzcash",
  ].filter(Boolean);

  const [select, setSelect] = useState(options[0] || "card");

  if (options.length === 0) {
    return (
      <Card variant="solid" className="p-6 text-muted">
        No online payment gateway is enabled for this store. Please contact the store or choose
        Cash on Delivery.
      </Card>
    );
  }

  return (
    <Card variant="solid" className="space-y-4 p-5 pb-8">
      {options.includes("card") && (
        <div>
          <button type="button" className="flex w-full items-center border-b border-border pb-4" onClick={() => setSelect("card")}>
            <RadioDot active={select === "card"} />
            <span className="pl-3 text-[17px] font-semibold text-content">Debit / Credit Card</span>
          </button>
          {select === "card" && (
            <form className="w-full pt-4" onSubmit={stripeHandler}>
              <div className="flex gap-3 pb-3">
                <div className="w-1/2">
                  <Label className="mb-1 block">Name on Card</Label>
                  <Input required defaultValue={user?.name} />
                </div>
                <div className="w-1/2">
                  <Label className="mb-1 block">Exp Date</Label>
                  <div className={stripeElementStyle}>
                    <CardExpiryElement options={{ style: { base: { fontSize: "14px" } } }} className="w-full" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pb-4">
                <div className="w-1/2">
                  <Label className="mb-1 block">Card Number</Label>
                  <div className={stripeElementStyle}>
                    <CardNumberElement options={{ style: { base: { fontSize: "14px" } } }} className="w-full" />
                  </div>
                </div>
                <div className="w-1/2">
                  <Label className="mb-1 block">CVV</Label>
                  <div className={stripeElementStyle}>
                    <CardCvcElement options={{ style: { base: { fontSize: "14px" } } }} className="w-full" />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {amountLabel}
              </Button>
            </form>
          )}
        </div>
      )}

      {options.includes("paypal") && (
        <div>
          <button type="button" className="flex w-full items-center border-b border-border pb-4" onClick={() => setSelect("paypal")}>
            <RadioDot active={select === "paypal"} />
            <span className="pl-3 text-[17px] font-semibold text-content">PayPal</span>
          </button>
          {select === "paypal" && (
            <div className="pt-4">
              <Button className="w-full" onClick={() => setOpen(true)}>
                {amountLabel}
              </Button>
              {open && (
                <div className="fixed inset-0 z-overlay flex items-center justify-center bg-black/50 p-4">
                  <Card variant="solid" className="relative max-h-[80vh] w-full max-w-md overflow-y-auto p-8">
                    <button onClick={() => setOpen(false)} className="absolute right-4 top-4">
                      <X className="size-[26px] text-content" />
                    </button>
                    <PayPalScriptProvider options={{ "client-id": paypalClientId }}>
                      <PayPalButtons style={{ layout: "vertical" }} onApprove={onApprove} createOrder={createOrder} />
                    </PayPalScriptProvider>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {options.includes("easypaisa") && (
        <div>
          <button type="button" className="flex w-full items-center border-b border-border pb-4" onClick={() => setSelect("easypaisa")}>
            <RadioDot active={select === "easypaisa"} />
            <span className="pl-3 text-[17px] font-semibold text-content">EasyPaisa</span>
          </button>
          {select === "easypaisa" && (
            <div className="pt-4">
              <Button onClick={() => walletHandler("easypaisa")} className="w-full bg-[#00A651] hover:bg-[#008f45]">
                {amountLabel}
              </Button>
            </div>
          )}
        </div>
      )}

      {options.includes("jazzcash") && (
        <div>
          <button type="button" className="flex w-full items-center border-b border-border pb-4" onClick={() => setSelect("jazzcash")}>
            <RadioDot active={select === "jazzcash"} />
            <span className="pl-3 text-[17px] font-semibold text-content">JazzCash</span>
          </button>
          {select === "jazzcash" && (
            <div className="pt-4">
              <Button onClick={() => walletHandler("jazzcash")} className="w-full bg-[#F15A29] hover:bg-[#d94c1f]">
                {amountLabel}
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between py-1">
      <span className={`text-[15px] ${accent || "text-muted"}`}>{label}</span>
      <span className={`text-[15px] font-semibold ${accent || "text-content"}`}>{value}</span>
    </div>
  );
}

function OrderTotals({ orderData, method, advancePercent, advanceAmount, remainingAmount, amountDueNow }) {
  return (
    <Card variant="solid" className="p-5">
      <Row label="Items total" value={formatPrice(orderData?.subTotal)} />
      <Row
        label={orderData?.delivery?.label || "Delivery fee"}
        value={orderData?.delivery?.free ? "FREE" : formatPrice(orderData?.shippingFee)}
      />
      {orderData?.codFee > 0 && <Row label="COD fee" value={formatPrice(orderData.codFee)} />}
      {orderData?.discount > 0 && <Row label="Voucher discount" value={`− ${formatPrice(orderData.discount)}`} accent="text-success" />}
      <div className="my-2 border-t border-border" />
      <Row label="Total" value={formatPrice(orderData?.totalPrice)} />
      <div className="my-2 border-t border-border" />
      <Row label="Payment method" value={METHOD_LABEL[method] || method} />
      {method === "partial_advance" && (
        <>
          <Row label={`Pay now (${advancePercent}%)`} value={formatPrice(advanceAmount)} accent="text-success" />
          <Row label="Pay on delivery" value={formatPrice(remainingAmount)} accent="text-danger" />
        </>
      )}
      {method === "online_full" && <Row label="Pay now" value={formatPrice(amountDueNow)} accent="text-success" />}
      {method === "cod" && <Row label="Pay on delivery" value={formatPrice(remainingAmount)} accent="text-danger" />}
      {orderData?.shippingAddress && (
        <div className="mt-3 border-t border-border pt-3 text-sm">
          <p className="mb-1 font-medium text-content">Deliver to</p>
          <p className="text-muted">
            {orderData.shippingAddress.fullName} · {orderData.shippingAddress.phone}
          </p>
          {formatAddressLines(orderData.shippingAddress).map((l) => (
            <p key={l} className="text-muted">
              {l}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
