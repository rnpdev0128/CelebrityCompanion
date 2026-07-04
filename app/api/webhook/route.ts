import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { prismadb } from '@/lib/prismadb'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            process.env.STRIPE_WEBHOOK_SECRET!,
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session

        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
        )

        const userId = session?.metadata?.userId

        if (!userId) {
            return new NextResponse('Webhook Error: Missing userId in session metadata', {
                status: 400,
            })
        }

        await prismadb.userSubscription.create({
            data: {
                userId,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    subscription.items.data[0].current_period_end * 1000,
                ),
            },
        })
    }

    if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object as Stripe.Invoice

        // subscription moved from invoice.subscription -> invoice.parent.subscription_details.subscription
        const subscriptionId = (invoice as any).parent?.subscription_details?.subscription as string

        if (!subscriptionId) {
            return new NextResponse('No subscription associated with invoice', { status: 200 })
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        await prismadb.userSubscription.update({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    subscription.items.data[0].current_period_end * 1000,
                ),
            },
        })
    }

    return new NextResponse(null, { status: 200 })
}
