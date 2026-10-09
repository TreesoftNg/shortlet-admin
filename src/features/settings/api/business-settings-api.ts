import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type {
  BookingRules,
  BookingSettings,
  BusinessProfile,
  BusinessProfileInput,
  PaymentSettings,
  PricingSettings,
  PricingSettingsInput,
  TenantDomainsInput,
  TenantDomainsResponse,
} from '../types';

export async function fetchBusinessProfile(): Promise<BusinessProfile> {
  return (await apiClient<BusinessProfile>(adminPath('/business-profile'))).data;
}

export async function updateBusinessProfile(input: BusinessProfileInput): Promise<BusinessProfile> {
  return (await apiClient<BusinessProfile>(adminPath('/business-profile'), { method: 'PUT', body: input })).data;
}

export async function fetchPricingSettings(): Promise<PricingSettings> {
  return (await apiClient<PricingSettings>(adminPath('/pricing-settings'))).data;
}

export async function updatePricingSettings(input: PricingSettingsInput): Promise<PricingSettings> {
  return (await apiClient<PricingSettings>(adminPath('/pricing-settings'), { method: 'PUT', body: input })).data;
}

export async function fetchBookingSettings(): Promise<BookingSettings> {
  return (await apiClient<BookingSettings>(adminPath('/booking-settings'))).data;
}

export async function updateBookingSettings(input: BookingRules): Promise<BookingSettings> {
  return (await apiClient<BookingSettings>(adminPath('/booking-settings'), { method: 'PUT', body: input })).data;
}

export async function fetchPaymentSettings(): Promise<PaymentSettings> {
  return (await apiClient<PaymentSettings>(adminPath('/payment-settings'))).data;
}

export async function fetchTenantDomains(): Promise<TenantDomainsResponse> {
  return (await apiClient<TenantDomainsResponse>(adminPath('/tenant-domains'))).data;
}

export async function updateTenantDomains(input: TenantDomainsInput): Promise<TenantDomainsResponse> {
  return (
    await apiClient<TenantDomainsResponse>(adminPath('/tenant-domains'), {
      method: 'PUT',
      body: input,
    })
  ).data;
}
