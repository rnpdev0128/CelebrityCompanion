# Celebrity Companion

An AI companion platform where users create, customize, and chat with their own AI personas — complete with persistent memory, subscription billing, and a fully custom UI component system.


## Overview

Celebrity Companion lets users design their own AI characters — defining a name, description, category, personality instructions, and example dialogue — then chat with them in real time. Conversations are backed by vector search so companions retain context across sessions rather than forgetting everything once the chat window closes. Premium features are gated behind Stripe subscription billing.

## Features

-  **Custom character creation** — name, short description, category, detailed behavior instructions, and example conversations to steer tone and personality
-  **Real-time streaming chat** — token-by-token AI responses for a natural, responsive feel
-  **Persistent memory** — conversation history is embedded and stored in a vector database, giving companions long-term recall beyond a single session's context window
-  **Authentication & session management** — secure sign-up/sign-in, protected routes, and per-user data isolation
-  **Subscription billing** — Stripe Checkout and webhook-driven provisioning gate premium features (e.g. unlimited companions)
-  **Custom design system** — accessible, composable UI components with theming support and a distinctive "premium" gradient treatment for upsell surfaces
-  **Fully responsive** — usable across desktop and mobile breakpoints
-  **Dark mode support** — CSS-variable-driven theming throughout

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| UI Library | [React](https://react.dev) |
| Language | TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), Radix UI primitives |
| Authentication | [Clerk](https://clerk.com) |
| Database / ORM | PostgreSQL + [Prisma](https://www.prisma.io) |
| AI / LLM | [OpenAI](https://openai.com), [Vercel AI SDK](https://sdk.vercel.ai) (`@ai-sdk/react`) for streaming completions |
| Vector memory | [Pinecone](https://www.pinecone.io) |
| Payments | [Stripe](https://stripe.com) (Checkout + Webhooks) |
| Icons | [Lucide](https://lucide.dev) |
| Deployment | [Vercel](https://vercel.com) |

## Architecture

```
User
 │
 ├─ Clerk middleware ─── protects all non-public routes
 │
 ├─ /companion/new ────── character-creation form
 │                         (name, description, category, instructions, example conversation)
 │
 ├─ /api/chat ──────────── streams AI responses via the Vercel AI SDK;
 │                         embeds + retrieves relevant memory from Pinecone
 │                         before each turn for contextual continuity
 │
 ├─ /api/stripe ────────── creates Checkout Sessions for subscription upgrades
 │
 ├─ /api/webhook ───────── handles Stripe events (checkout.session.completed,
 │                         invoice.payment_succeeded) to create/update
 │                         subscription records
 │
 └─ Prisma ─────────────── PostgreSQL: users, companions, messages, subscriptions
```

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database
- Accounts and API keys for: Clerk, OpenAI, Pinecone, Stripe

### Installation

```bash
git clone https://github.com/rnpdev0128/celebrity-companion.git
cd celebrity-companion
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your own values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `OPENAI_API_KEY` | OpenAI API key |
| `PINECONE_API_KEY` | Pinecone API key |
| `PINECONE_INDEX` | Pinecone index name |
| `STRIPE_API_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | Base URL of the app (used for redirects) |

### Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### Run Locally

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

To test Stripe webhooks locally, forward events with the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

## Adding UI Components

New shadcn/ui components can be added on demand via the CLI, keeping the dependency footprint minimal:

```bash
npx shadcn@latest add button
```

Components are placed directly into `components/ui`, so they're fully owned and editable rather than pulled from an external package.

## Project Structure

```
.
├── app/
│   ├── (dashboard)/          # Authenticated app routes (companion list, chat, settings)
│   ├── api/
│   │   ├── chat/              # Streaming chat endpoint
│   │   ├── stripe/            # Checkout session creation
│   │   └── webhook/           # Stripe webhook handler
│   └── (auth)/                # Sign-in / sign-up routes
├── components/
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── prismadb.ts             # Prisma client singleton
│   ├── stripe.ts               # Stripe client configuration
│   └── pinecone.ts             # Pinecone client + memory retrieval helpers
├── prisma/
│   └── schema.prisma            # Database schema
└── public/                      # Static assets
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Browse the database visually |

