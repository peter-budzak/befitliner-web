import { HttpError } from "./fitliner_payments.ts";
import { proStripeConfig, proStripeRequest } from "./fitliner_pro_stripe.ts";

type Coupon = {
  id: string;
  valid: boolean;
  livemode: boolean;
  duration: string;
  percent_off: number;
  applies_to?: { products?: string[] };
};

export async function ensureProCoupon(config: ReturnType<typeof proStripeConfig>, percent: 20 | 30) {
  const id = `fitliner_pro_first_payment_${percent}_v1`;
  const path = `/v1/coupons/${id}?expand%5B%5D=applies_to`;
  let coupon: Coupon;
  try {
    coupon = await proStripeRequest<Coupon>(config, path);
  } catch (error) {
    if (!(error instanceof HttpError)) throw error;
    try {
      await proStripeRequest(config, "/v1/coupons", new URLSearchParams({
        id, duration: "once", percent_off: String(percent),
        name: `Fitliner PRO – ${percent}% na prvú platbu`,
        "applies_to[products][0]": config.productId,
      }), id);
    } catch (createError) {
      if (!(createError instanceof HttpError)) throw createError;
    }
    coupon = await proStripeRequest<Coupon>(config, path);
  }
  if (coupon.id !== id || coupon.livemode !== config.live || !coupon.valid ||
      coupon.duration !== "once" || coupon.percent_off !== percent ||
      coupon.applies_to?.products?.length !== 1 || coupon.applies_to.products[0] !== config.productId) {
    throw new HttpError(503, "Invalid Fitliner PRO coupon");
  }
  return id;
}
