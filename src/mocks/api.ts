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
  buildGuestFromForm,
  buildReservationFromForm,
  type BookingFormValues,
} from '@/features/bookings/utils/booking-form';
import {
  buildPropertyFromForm,
  syncUnitsForProperty,
  type PropertyFormValues,
} from '@/features/properties/utils/property-form';
import {
  buildUnitFromForm,
  type UnitFormValues,
} from '@/features/units/utils/unit-form';
import { delay, ok } from '@/mocks/utils';
import type { ApiSuccessResponse } from '@/shared/api/types';
import type {
  AvailabilityCalendar,
  CalendarRange,
  DashboardSummary,
  Guest,
  Message,
  Property,
  ReportsSummary,
  Reservation,
  Review,
  StaffMember,
  TenantSettings,
  Unit,
} from '@/shared/types/hospitable';

function replaceUnits(next: Unit[]) {
  mockUnits.splice(0, mockUnits.length, ...next);
}

function nextUnitId(): number {
  return mockUnits.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export const mockApi = {
  async getDashboardSummary(): Promise<ApiSuccessResponse<DashboardSummary>> {
    await delay();
    return ok(mockDashboardSummary);
  },

  async getReservations(): Promise<ApiSuccessResponse<Reservation[]>> {
    await delay();
    return ok([...mockReservations], 'Reservations retrieved', {
      page: 1,
      limit: 20,
      total: mockReservations.length,
      totalPages: 1,
    });
  },

  async createReservation(
    values: BookingFormValues,
  ): Promise<ApiSuccessResponse<Reservation>> {
    await delay();

    const property = mockProperties.find(
      (item) => item.id === Number(values.property_id),
    );
    if (!property) {
      throw new Error('Property not found');
    }

    const unit = mockUnits.find((item) => item.id === Number(values.unit_id));
    if (!unit) {
      throw new Error('Unit not found');
    }
    if (unit.property_id !== property.id) {
      throw new Error('Unit does not belong to the selected property');
    }
    if (!unit.bookable || unit.status === 'inactive') {
      throw new Error('Selected unit is not bookable');
    }

    let guest: Guest;
    if (values.guest_mode === 'existing') {
      const existing = mockGuests.find((item) => item.id === values.guest_id);
      if (!existing) {
        throw new Error('Customer not found');
      }
      guest = existing;
    } else {
      const nextGuestId = `gst-${String(mockGuests.length + 1).padStart(3, '0')}`;
      guest = buildGuestFromForm(values, nextGuestId);
      mockGuests.unshift(guest);
    }

    const nextId = `rsv-${String(mockReservations.length + 1).padStart(3, '0')}`;
    const reservation = buildReservationFromForm(values, {
      guest,
      property,
      unit,
      nextId,
    });
    mockReservations.unshift(reservation);
    return ok(reservation, 'Booking created');
  },

  async checkInReservation(
    id: string,
  ): Promise<ApiSuccessResponse<Reservation>> {
    await delay();
    const reservation = mockReservations.find((item) => item.id === id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    const { category, sub_category } = reservation.reservation_status.current;
    if (category === 'cancelled' || sub_category === 'voided') {
      throw new Error('Cancelled bookings cannot be checked in');
    }
    if (sub_category === 'checked_in') {
      return ok(reservation, 'Guest already checked in');
    }
    if (sub_category === 'completed') {
      throw new Error('Completed stays cannot be checked in');
    }
    if (sub_category === 'request for payment') {
      throw new Error('Guest must complete payment before check-in');
    }

    const changed_at = new Date().toISOString();
    reservation.reservation_status = {
      current: { category: 'accepted', sub_category: 'checked_in' },
      history: [
        { category: 'accepted', sub_category: 'checked_in', changed_at },
        ...reservation.reservation_status.history,
      ],
    };
    reservation.updated_at = changed_at;

    return ok(reservation, 'Guest checked in');
  },

  async cancelReservation(
    id: string,
  ): Promise<ApiSuccessResponse<Reservation>> {
    await delay();
    const reservation = mockReservations.find((item) => item.id === id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    const { category, sub_category } = reservation.reservation_status.current;
    if (category === 'cancelled' || sub_category === 'voided' || sub_category === 'refunded') {
      return ok(reservation, 'Booking already cancelled');
    }
    if (sub_category === 'completed') {
      throw new Error('Completed stays cannot be cancelled');
    }

    const changed_at = new Date().toISOString();
    reservation.reservation_status = {
      current: { category: 'cancelled', sub_category: 'voided' },
      history: [
        { category: 'cancelled', sub_category: 'voided', changed_at },
        ...reservation.reservation_status.history,
      ],
    };
    reservation.updated_at = changed_at;

    return ok(reservation, 'Booking cancelled');
  },

  async refundReservation(
    id: string,
  ): Promise<ApiSuccessResponse<Reservation>> {
    await delay();
    const reservation = mockReservations.find((item) => item.id === id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    const { category, sub_category } = reservation.reservation_status.current;
    if (category === 'cancelled' || sub_category === 'voided' || sub_category === 'refunded') {
      throw new Error('This booking has already been refunded or cancelled');
    }
    if (sub_category === 'request for payment') {
      throw new Error('No payment to refund');
    }
    if (reservation.platform === 'airbnb' || sub_category === 'external') {
      throw new Error('Refunds for external bookings are handled on the channel');
    }
    if (!reservation.financials || reservation.financials.total <= 0) {
      throw new Error('No payment to refund');
    }

    const changed_at = new Date().toISOString();
    reservation.reservation_status = {
      current: { category: 'cancelled', sub_category: 'refunded' },
      history: [
        { category: 'cancelled', sub_category: 'refunded', changed_at },
        ...reservation.reservation_status.history,
      ],
    };
    reservation.updated_at = changed_at;

    return ok(reservation, 'Refund issued');
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
    const nextId =
      mockProperties.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const property = buildPropertyFromForm(values, null, nextId);
    mockProperties.unshift(property);
    replaceUnits(syncUnitsForProperty(mockUnits, property, values.unit_count));
    return ok(property, 'Property created');
  },

  async updateProperty(
    id: number,
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

  async createUnit(
    values: UnitFormValues,
  ): Promise<ApiSuccessResponse<Unit>> {
    await delay();
    const unit = buildUnitFromForm(values, null, nextUnitId());
    mockUnits.unshift(unit);
    return ok(unit, 'Unit created');
  },

  async updateUnit(
    id: number,
    values: UnitFormValues,
  ): Promise<ApiSuccessResponse<Unit>> {
    await delay();
    const index = mockUnits.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error('Unit not found');
    }
    const unit = buildUnitFromForm(values, mockUnits[index]);
    mockUnits[index] = unit;
    return ok(unit, 'Unit updated');
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
    propertyId?: number | 'all';
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
