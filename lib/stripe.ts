import Stripe from 'stripe'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: null as any,
  typescript: true,
})