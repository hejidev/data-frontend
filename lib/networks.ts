export const NETWORKS = [
    { id: 'MTN', label: 'MTN', dot: 'bg-yellow-400' },
    { id: 'AIRTEL', label: 'Airtel', dot: 'bg-red-500' },
    { id: 'GLO', label: 'Glo', dot: 'bg-green-500' },
    { id: '9MOBILE', label: '9mobile', dot: 'bg-emerald-700' },
  ] as const;
  
  export type NetworkId = (typeof NETWORKS)[number]['id'];
  
  // Mirrors the backend validator
  export const PHONE_RE = /^(0|\+?234)[789][01]\d{8}$/;