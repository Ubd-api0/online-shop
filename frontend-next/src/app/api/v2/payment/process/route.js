import { NextResponse } from "next/server";
import Stripe from "stripe";
import { withErrorHandling } from "@/lib/api/errors";

export const POST = withErrorHandling(async (request) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { amount } = await request.json();

  const myPayment = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    metadata: { integration_check: "accept_a_payment" },
  });

  return NextResponse.json({ success: true, client_secret: myPayment.client_secret });
});
