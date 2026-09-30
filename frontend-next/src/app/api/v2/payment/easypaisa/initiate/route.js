import { NextResponse } from "next/server";
import axios from "axios";
import { withErrorHandling } from "@/lib/api/errors";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3030";

const hasEasypaisaKeys = () =>
  !!(process.env.EASYPAISA_STORE_ID && process.env.EASYPAISA_API_URL);

const mockRedirect = (gateway, { amount, orderRef }) =>
  `${FRONTEND_URL}/payment/mock?gateway=${gateway}` +
  `&orderRef=${encodeURIComponent(orderRef || Date.now())}` +
  `&amount=${encodeURIComponent(amount || 0)}`;

export const POST = withErrorHandling(async (request) => {
  const { amount, orderRef, customerEmail, customerMobile } = await request.json();

  if (!hasEasypaisaKeys()) {
    return NextResponse.json({
      success: true,
      mock: true,
      redirectUrl: mockRedirect("easypaisa", { amount, orderRef }),
      message: "EasyPaisa credentials not configured — using sandbox mock flow.",
    });
  }

  const payload = {
    storeId: process.env.EASYPAISA_STORE_ID,
    amount,
    postBackURL: process.env.EASYPAISA_CALLBACK_URL,
    orderRefNum: orderRef,
    autoRedirect: 1,
    emailAddr: customerEmail,
    mobileNum: customerMobile,
  };

  const response = await axios.post(process.env.EASYPAISA_API_URL, payload);
  return NextResponse.json({
    success: true,
    mock: false,
    redirectUrl: response.data.paymentUrl,
  });
});
