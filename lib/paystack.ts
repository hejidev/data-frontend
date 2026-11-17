const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY!);

export interface PaymentData {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, any>;
}

export async function initializePayment(data: PaymentData) {
  try {
    const response = await paystack.transaction.initialize({
      email: data.email,
      amount: data.amount * 100, // Paystack expects amount in kobo
      reference: data.reference,
      metadata: data.metadata,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback`,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Paystack initialization error:', error);
    return { success: false, error };
  }
}

export async function verifyTransaction(reference: string) {
  try {
    const response = await paystack.transaction.verify(reference);
    return { success: true, data: response };
  } catch (error) {
    console.error('Paystack verification error:', error);
    return { success: false, error };
  }
}
