import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
})

export const PLANS = {
  free: {
    name: "Free",
    priceId: null,
    price: 0,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 1980,
  },
  max: {
    name: "Max",
    priceId: process.env.STRIPE_MAX_PRICE_ID!,
    price: 4980,
  },
} as const

export type PlanType = keyof typeof PLANS
