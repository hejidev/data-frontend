export type SiteSettings = {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  legalName: string;
  address: string;
  rcNumber: string;
  maintenanceMode: boolean;
  referralEnabled: boolean;
  referralRewardNaira: number;
};


export const DEFAULT_SITE: SiteSettings = {
  siteName: 'NetLink',
  supportEmail: '',
  supportPhone: '',
  legalName: '',
  address: '',
  rcNumber: '',
  maintenanceMode: false,
  referralEnabled: false,
  referralRewardNaira: 100,
};