export type ServiceSlug =
  | 'data' | 'airtime' | 'wallet' | 'cable-tv' | 'electricity'
  | 'education' | 'international' | 'gift-cards';

export interface ServiceDef {
  slug: ServiceSlug;
  title: string;
  tagline: string;
  description: string;
  live: boolean;
  features: string[];
  steps: string[];
  faqs: { q: string; a: string }[];
}

// Text may contain {{siteName}}; it is filled in when rendered, so renaming the company updates everything.
export const SERVICES: ServiceDef[] = [
  {
    slug: 'data',
    title: 'Data bundles',
    tagline: 'Affordable bundles for every Nigerian network',
    description: 'Buy daily, weekly and monthly data for MTN, Airtel, Glo and 9mobile straight from your {{siteName}} wallet.',
    live: true,
    features: ['All four major networks', 'Live prices from our catalogue', 'Order history with references', 'Automatic refund if delivery fails'],
    steps: ['Fund your wallet', 'Pick a network and plan', 'Enter the number and confirm with your PIN'],
    faqs: [
      { q: 'Which networks are supported?', a: 'MTN, Airtel, Glo and 9mobile.' },
      { q: 'How long does delivery take?', a: 'Most orders complete within seconds. If a provider is slow the order shows "processing" and we confirm or refund it automatically.' },
      { q: 'Can I buy data for someone else?', a: 'Yes. Enter their number carefully: value delivered to a wrong number cannot be recovered.' },
    ],
  },
  {
    slug: 'airtime',
    title: 'Airtime top-up',
    tagline: 'Instant airtime for any number',
    description: 'Top up any Nigerian number from ₦50 to ₦50,000 using your {{siteName}} wallet.',
    live: true,
    features: ['Any amount from ₦50 to ₦50,000', 'MTN, Airtel, Glo and 9mobile', 'PIN-protected purchases', 'Full order history'],
    steps: ['Choose the network', 'Enter the amount and number', 'Confirm with your PIN'],
    faqs: [
      { q: 'What is the minimum amount?', a: 'The minimum airtime purchase is ₦50.' },
      { q: 'What if my airtime does not arrive?', a: 'If the provider reports a failure your wallet is refunded automatically. If an order stays in "processing", we keep checking with the provider and resolve it for you.' },
    ],
  },
  {
    slug: 'wallet',
    title: 'Smart wallet',
    tagline: 'Fund once, pay for everything',
    description: 'Your {{siteName}} wallet keeps a full ledger of every credit and debit, funded securely through Paystack.',
    live: true,
    features: ['Secure funding via Paystack', 'Complete credit/debit ledger', 'Transaction PIN and optional 2FA', 'Instant refunds back to your wallet'],
    steps: ['Open Wallet and enter an amount', 'Pay with Paystack', 'Your balance updates once payment is confirmed'],
    faqs: [
      { q: 'Is my card stored?', a: 'No. Payments are handled by Paystack; we only receive the payment reference and status.' },
      { q: 'What if I was charged but not credited?', a: 'Contact support with the payment reference and we will investigate. Pending payments are also re-checked automatically.' },
    ],
  },
  {
    slug: 'cable-tv',
    title: 'Cable TV',
    tagline: 'Renew your decoder from your wallet',
    description: 'Pay for popular TV subscriptions without leaving {{siteName}}.',
    live: false,
    features: ['Renew with your smartcard or IUC number', 'Instant confirmation', 'Receipts in your order history'],
    steps: ['Enter your decoder number', 'Choose a package', 'Pay from your wallet'],
    faqs: [{ q: 'When will this launch?', a: 'It is next on our roadmap. Tell us what you need on the Contact page and we will let you know.' }],
  },
  {
    slug: 'electricity',
    title: 'Electricity',
    tagline: 'Prepaid and postpaid meter payments',
    description: 'Buy electricity tokens or pay postpaid bills from your {{siteName}} wallet.',
    live: false,
    features: ['Prepaid tokens delivered instantly', 'Postpaid bill payments', 'Token history in your account'],
    steps: ['Enter your meter number', 'Choose amount', 'Receive your token'],
    faqs: [{ q: 'When will this launch?', a: 'It is on our roadmap. Contact us to be notified.' }],
  },
  {
    slug: 'education',
    title: 'Education pins',
    tagline: 'Exam result checkers and registration pins',
    description: 'Buy exam-related pins from the same wallet you use for data and airtime.',
    live: false,
    features: ['Instant pin delivery', 'Saved in your order history'],
    steps: ['Choose a pin', 'Pay from your wallet', 'Receive your pin'],
    faqs: [{ q: 'When will this launch?', a: 'It is on our roadmap. Contact us to be notified.' }],
  },
  {
    slug: 'international',
    title: 'International top-up',
    tagline: 'Send airtime and data abroad',
    description: 'Top up family and friends in other countries from your {{siteName}} wallet.',
    live: false,
    features: ['Airtime and data for other countries', 'Clear pricing before you confirm', 'Same wallet and PIN'],
    steps: ['Choose a country and operator', 'Enter the number', 'Confirm and pay'],
    faqs: [{ q: 'When will this launch?', a: 'International services are planned after our core bill payments. Contact us to join the list.' }],
  },
  {
    slug: 'gift-cards',
    title: 'Gift cards & eSIM',
    tagline: 'Digital gift cards and travel eSIMs',
    description: 'Buy digital gift cards and eSIMs with your {{siteName}} wallet.',
    live: false,
    features: ['Digital delivery', 'Codes saved in your account'],
    steps: ['Pick a product', 'Pay from your wallet', 'Receive your code'],
    faqs: [{ q: 'When will this launch?', a: 'It is planned. Contact us to be notified.' }],
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);