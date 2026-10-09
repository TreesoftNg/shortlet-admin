'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  fetchBookingSettings,
  fetchBusinessProfile,
  fetchPaymentSettings,
  fetchPricingSettings,
  fetchTenantDomains,
  updateBookingSettings,
  updateBusinessProfile,
  updatePricingSettings,
  updateTenantDomains,
} from '../api/business-settings-api';
import type {
  BookingRules,
  BusinessProfileInput,
  PricingSettingsInput,
  TenantDomainsInput,
} from '../types';

export function useBusinessProfile(enabled = true) {
  return useQuery({ queryKey: queryKeys.settings.profile(), queryFn: fetchBusinessProfile, enabled });
}

export function usePricingSettings() {
  return useQuery({ queryKey: queryKeys.settings.pricing(), queryFn: fetchPricingSettings });
}

export function useBookingSettings() {
  return useQuery({ queryKey: queryKeys.settings.booking(), queryFn: fetchBookingSettings });
}

export function usePaymentSettings(enabled = true) {
  return useQuery({ queryKey: queryKeys.settings.payments(), queryFn: fetchPaymentSettings, enabled });
}

export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BusinessProfileInput) => updateBusinessProfile(input),
    onSuccess: (saved) => {
      queryClient.setQueryData(queryKeys.settings.profile(), saved);
      // The business name shows in the sidebar from the signed-in profile.
      return queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useUpdatePricingSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PricingSettingsInput) => updatePricingSettings(input),
    onSuccess: (saved) => {
      queryClient.setQueryData(queryKeys.settings.pricing(), saved);
      // Prices for new bookings change.
      queryClient.removeQueries({ queryKey: [...queryKeys.adminBookings.all, 'quote'] });
    },
  });
}

export function useUpdateBookingSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BookingRules) => updateBookingSettings(input),
    onSuccess: (saved) => {
      queryClient.setQueryData(queryKeys.settings.booking(), saved);
      queryClient.removeQueries({ queryKey: [...queryKeys.adminBookings.all, 'quote'] });
    },
  });
}

export function useTenantDomains(enabled = true) {
  return useQuery({
    queryKey: queryKeys.settings.domains(),
    queryFn: fetchTenantDomains,
    enabled,
  });
}

export function useUpdateTenantDomains() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TenantDomainsInput) => updateTenantDomains(input),
    onSuccess: (saved) => {
      queryClient.setQueryData(queryKeys.settings.domains(), saved);
    },
  });
}
