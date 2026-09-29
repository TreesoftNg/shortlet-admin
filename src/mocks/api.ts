import {
  mockDashboardSummary,
  mockGuests,
  mockProperties,
  mockReservations,
  mockUnits,
} from '@/mocks/data';
import { buildMockAvailabilityCalendar } from '@/mocks/data/availability';
import {
  mockConversations,
  mockMessages,
  type ConversationListItem,
} from '@/mocks/data/messaging';
import {
  buildPaymentList,
  type PaymentListItem,
} from '@/mocks/data/payments';
import {
  buildRefundList,
  type RefundListItem,
} from '@/mocks/data/refunds';
import { mockReportsSummary } from '@/mocks/data/reports';
import { mockReviews } from '@/mocks/data/reviews';
import { mockStaff } from '@/mocks/data/staff';
import { mockTenantSettings } from '@/mocks/data/settings';
import { buildCustomerList } from '@/features/customers/utils/customer-filters';
import type { CustomerListItem } from '@/features/customers/utils/customer-filters';
import {
  buildPropertyFromForm,
  syncUnitsForProperty,
  type PropertyFormValues,
} from '@/features/properties/utils/property-form';
import { delay, ok } from '@/mocks/utils';
import type { ApiSuccessResponse } from '@/shared/api/types';
import type {
  AvailabilityCalendar,
  CalendarRange,
  DashboardSummary,
  Message,
  Property,
  ReportsSummary,
  Reservation,
  Review,
  StaffMember,
  TenantSettings,
  Unit,
} from '@/shared/types/hospitable';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';

function replaceUnits(next: Unit[]) {
  mockUnits.splice(0, mockUnits.length, ...next);
}

export const mockApi = {
  async getDashboardSummary(): Promise<ApiSuccessResponse<DashboardSummary>> {
    await delay();
    return ok(mockDashboardSummary);
  },

  async getReservations(): Promise<ApiSuccessResponse<Reservation[]>> {
    await delay();
    return ok(mockReservations, 'Reservations retrieved', {
      page: 1,
      limit: 20,
      total: mockReservations.length,
      totalPages: 1,
    });
  },

  async getProperties(): Promise<ApiSuccessResponse<Property[]>> {
    await delay();
    return ok([...mockProperties], 'Properties retrieved', {
      page: 1,
      limit: 20,
      total: mockProperties.length,
      totalPages: 1,
    });
  },

  async createProperty(
    values: PropertyFormValues,
  ): Promise<ApiSuccessResponse<Property>> {
    await delay();
    const property = buildPropertyFromForm(values);
    mockProperties.unshift(property);
    replaceUnits(syncUnitsForProperty(mockUnits, property, values.unit_count));
    return ok(property, 'Property created');
  },

  async updateProperty(
    id: string,
    values: PropertyFormValues,
  ): Promise<ApiSuccessResponse<Property>> {
    await delay();
    const index = mockProperties.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error('Property not found');
    }
    const property = buildPropertyFromForm(values, mockProperties[index]);
    mockProperties[index] = property;
    replaceUnits(syncUnitsForProperty(mockUnits, property, values.unit_count));
    return ok(property, 'Property updated');
  },

  async getUnits(): Promise<ApiSuccessResponse<Unit[]>> {
    await delay();
    return ok([...mockUnits], 'Units retrieved', {
      page: 1,
      limit: 20,
      total: mockUnits.length,
      totalPages: 1,
    });
  },

  async getCustomers(): Promise<ApiSuccessResponse<CustomerListItem[]>> {
    await delay();
    const customers = buildCustomerList(mockGuests, mockReservations);
    return ok(customers, 'Customers retrieved', {
      page: 1,
      limit: 50,
      total: customers.length,
      totalPages: 1,
    });
  },

  async getConversations(): Promise<ApiSuccessResponse<ConversationListItem[]>> {
    await delay();
    return ok(mockConversations, 'Conversations retrieved', {
      page: 1,
      limit: 50,
      total: mockConversations.length,
      totalPages: 1,
    });
  },

  async getConversationMessages(
    conversationId: string,
  ): Promise<ApiSuccessResponse<Message[]>> {
    await delay();
    const messages = mockMessages
      .filter((item) => item.conversation_id === conversationId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    return ok(messages, 'Messages retrieved');
  },

  async getReviews(): Promise<ApiSuccessResponse<Review[]>> {
    await delay();
    return ok(mockReviews, 'Reviews retrieved', {
      page: 1,
      limit: 50,
      total: mockReviews.length,
      totalPages: 1,
    });
  },

  async getPayments(): Promise<ApiSuccessResponse<PaymentListItem[]>> {
    await delay();
    const payments = buildPaymentList();
    return ok(payments, 'Payments retrieved', {
      page: 1,
      limit: 50,
      total: payments.length,
      totalPages: 1,
    });
  },

  async getRefunds(): Promise<ApiSuccessResponse<RefundListItem[]>> {
    await delay();
    const refunds = buildRefundList();
    return ok(refunds, 'Refunds retrieved', {
      page: 1,
      limit: 50,
      total: refunds.length,
      totalPages: 1,
    });
  },

  async getReports(): Promise<ApiSuccessResponse<ReportsSummary>> {
    await delay();
    return ok(mockReportsSummary, 'Reports retrieved');
  },

  async getStaff(): Promise<ApiSuccessResponse<StaffMember[]>> {
    await delay();
    return ok(mockStaff, 'Staff retrieved', {
      page: 1,
      limit: 50,
      total: mockStaff.length,
      totalPages: 1,
    });
  },

  async getSettings(): Promise<ApiSuccessResponse<TenantSettings>> {
    await delay();
    return ok(mockTenantSettings, 'Settings retrieved');
  },

  async getAvailabilityCalendar(params: {
    anchorDate: string;
    range: CalendarRange;
    propertyId?: string | 'all';
  }): Promise<ApiSuccessResponse<AvailabilityCalendar>> {
    await delay();
    return ok(
      buildMockAvailabilityCalendar(
        params.anchorDate,
        params.range,
        params.propertyId ?? 'all',
      ),
      'Availability calendar retrieved',
    );
  },
};

export function isMockMode(): boolean {
  return USE_MOCKS;
}
