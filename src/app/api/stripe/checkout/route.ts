import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    // Fallback: no Stripe key configured, return success redirect
    // so the client-side can activate ad-free via localStorage
    return NextResponse.json(
      { url: null, message: "Stripe not configured" },
      { status: 200 },
    );
  }

  const stripe = new Stripe(secretKey);

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: "Matchflix — Remover Anuncios",
            description: "Remova todos os anuncios do app para sempre",
          },
          unit_amount: 1000, // R$10.00 in centavos
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/?payment=success`,
    cancel_url: `${origin}/`,
  });

  return NextResponse.json({ url: session.url });
}
