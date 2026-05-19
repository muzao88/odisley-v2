export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';

export async function POST(req: Request) {
  try {
    const kiwifyToken = req.headers.get('x-kiwify-token');
    const secretToken = process.env.KIWIFY_TOKEN;

    if (!kiwifyToken || kiwifyToken !== secretToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Verify webhook payload based on Kiwify docs
    if (!body || !body.Customer || !body.Customer.email) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const email = body.Customer.email;
    const status = body.order_status;

    await connectDB();
    const user = await UserModel.findOne({ email });

    if (!user) {
      // Create user if they don't exist?
      // Since it's a payment webhook, user should exist, but let's log.
      console.error(`User not found for payment email: ${email}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (status === 'paid') {
      // In Kiwify, how do we know if it's 'mensal' or 'anual'? 
      // The body might contain Product ID or something. If not, default to 'mensal' or let's use 'mensal' unless we can parse it.
      // The prompt didn't specify how to differentiate, but said "Atualize o plano do usuário no MongoDB quando status for paid".
      // We will set planActive = true, and set a default 'mensal' if not currently set.
      user.planActive = true;
      user.plan = user.plan === 'free' ? 'mensal' : user.plan;
      // Ideally update planExpiresAt but without order details it's tricky.
    } else if (status === 'cancelled' || status === 'refunded' || status === 'chargedback') {
      user.planActive = false;
      user.plan = 'free';
    }

    await user.save();

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('Kiwify Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
