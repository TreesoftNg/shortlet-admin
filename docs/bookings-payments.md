# Plan: bookings, payments, refunds and deposits on the live API

Status: **plan only, not built.** The API side is done (shortlet-api branch `bookings`; see its `docs/payments.md` and README "Bookings and checkout").

## Goal

Staff run direct bookings from the admin:
- see and filter bookings;
- open a booking (guest, stay, frozen price, deposit, payments, refunds, timeline);
- check guests in and cancel;
- refund the stay in part or in full;
- release security deposits after check-out.

Every page and action is gated by the staff member's permissions. The bookings, payments and refunds pages exist today on `mockApi` with Hospitable-style mock types; this plan moves them to the live API.

## API in one table

| Screen | Endpoint | Permission |
| --- | --- | --- |
| Bookings list | `GET /cc/bookings?page&limit&status&unitId&propertyId&from&to&deposit=due\|overdue&search` | `booking.read` |
| Booking detail | `GET /cc/bookings/:id` | `booking.read` |
| Check in | `POST /cc/bookings/:id/check-in` | `booking.update` |
| Cancel | `POST /cc/bookings/:id/cancel` `{ reason }` | `booking.cancel` |
| Release deposit | `POST /cc/bookings/:id/deposit/release` `{ refundAmount, deductionReason? }` | `payment.refund` |
| Payments list | `GET /cc/payments?page&limit&status&bookingId&search` | `payment.read` |
| Payment detail | `GET /cc/payments/:id` (with refunds) | `payment.read` |
| Check with Flutterwave | `POST /cc/payments/:id/verify` | `payment.read` |
| Refund the stay | `POST /cc/payments/:id/refunds` `{ amount, reason, note? }` | `payment.refund` |

Money arrives as 2-decimal strings (`"222000.00"`); send numbers with at most 2 decimals. Errors use the usual envelope:
- `VALIDATION_ERROR` with `details.fields.amount`, `details.fields.deductionReason` and so on;
- `RESOURCE_CONFLICT` when the action doesn't fit the booking's state.

Booking statuses: `pending_payment`, `confirmed`, `checked_in`, `completed`, `cancelled`, `expired`. Deposit statuses: `pending`, `held`, `refunded`, `partially_refunded`, `retained`, `none`.

## Step 1: types and API services

- **Types.** `src/features/bookings/types.ts` gets `BookingListItem`, `AdminBooking` (with `price`, `deposit`, `payments`, `refunds`, `timeline`), `PaymentView`, `RefundView` and the status unions, matching the API's mappers. Use string ids. Retire `Reservation` and Hospitable `Payment`/`Refund` from `src/shared/types/hospitable.ts` for these pages.
- **Services.**
  - `features/bookings/api/bookings-service.ts` → `apiClient` calls for list, detail, check-in, cancel and deposit release.
  - `features/payments/api/payments-service.ts` → list, detail, verify and refund.
  - Follow `features/calendar-sync/api/calendar-sync-api.ts`: unwrap `.data`, and read `meta` for pages.
- **Query keys** (`src/shared/api/query-keys.ts`):
  - `bookings: { all, list(filters), detail(id) }`
  - `payments: { all, list(filters), detail(id) }`
  - Remove `reservations` once nothing uses it.
- **Hooks.**
  - `useBookings(filters)`, `useBooking(id)`, `usePayments(filters)`, `usePayment(id)`.
  - Mutations: `useCheckIn`, `useCancelBooking`, `useReleaseDeposit`, `useRefundStay`, `useVerifyPayment`.
  - Each mutation invalidates `bookings.detail(id)`, `bookings.list`, the related `payments.*`, and the customers list (stays and spend change).

## Step 2: bookings list (`features/bookings/components/bookings-page.tsx`)

- **Columns:** reference, guest, unit (+ property), dates and nights, guests, total, paid/refunded, status chip, deposit chip.
- **Toolbar filters:** status, property → unit (live `/cc/properties` and `/cc/units`), date range, search (reference, guest name, email, phone). Filters live in the URL.
- **Quick tabs:**
  - All, Upcoming (`status=confirmed&from=today`), In stay (`checked_in`), Cancelled.
  - **Deposits to release** (`deposit=due`, soonest due first, an "Overdue" badge when `depositDueAt` has passed).
- Server-side paging from `meta`.
- Remove the mock "create booking" form for now; staff-created bookings aren't in the API yet.

## Step 3: booking detail (drawer, plus a full page at `/bookings/[id]`)

- **Header:** reference, status chip, actions.
  - **Check in:** confirmed, from check-in day.
  - **Cancel:** dialog with a required reason. Its copy says "No money is refunded; refund separately."
- **Guest:** name, email, phone (copy buttons), special requests, house rules accepted at.
- **Stay:** unit, dates, check-in/out times, guests (adults/children/infants).
- **Price (frozen):** nightly lines, discount, cleaning, service fee, tax, stay total, deposit, total paid.
- **Deposit panel:**
  - Status, amount, due-by countdown (red when overdue), and the deduction reason once settled.
  - **Release deposit** dialog: amount (default the full deposit, max the deposit), plus a "Reason for keeping part" field that's required whenever the amount is less than the full deposit. Shown only to `payment.refund`.
- **Payments:** each attempt with status, method, Flutterwave transaction id, fee, refunded amount, and a **Check with Flutterwave** button (verify).
- **Refunds:** kind (stay / deposit / automatic), amount, reason, note, status, who and when. Failed refunds show their reason.
- **Refund stay** dialog (on the confirming payment):
  - amount up to `stayTotal - stayRefunded`, shown as "Up to ₦X";
  - reason select: `guest_cancellation`, `host_cancellation`, `partial_stay`, `service_issue`, `duplicate_charge`, `other`;
  - note.

  Shown only to `payment.refund`.
- **Timeline:** reserved, confirmed, checked in, completed, cancelled, refunds, deposit settled.

## Step 4: payments and refunds pages

- **Payments page:** the live list (filters: status, search) with a link to the booking. The drawer shows the payment and its refunds.
- **Refunds:**
  - Fold the separate refunds page into the booking and payment views, since refunds always belong to a payment.
  - Keep a **"Needs refund decision"** list: bookings with `status=cancelled`, `cancelledBy=guest`, and money still unrefunded (`amountPaid > amountRefunded`). This can be computed from the bookings list filtered to cancelled; add an API filter later if it gets slow.
  - Delete the mock refund-approval workflow.

## Step 5: unit, property and customer forms

- **Unit form:** add **Minimum nights** and **Maximum nights** (empty = no limit), validated min ≤ max, mapped to `minNights` / `maxNights`.
- **Property form:** add a **House rules** textarea (`houseRules`, up to 5,000 characters), shown to guests before they pay.
- **Customers page:** `staysCount`, `upcomingStays` and `totalSpent` are real now; the "With stays" and "New" tabs filter server-side.

## Step 6: permissions and copy

- Hide or disable actions the user lacks the permission for: `booking.update`, `booking.cancel` and `payment.refund`. Managers can't refund; staff only read bookings and check guests in.
- Show `RESOURCE_CONFLICT` messages from the API as toasts. They are written for staff (e.g. "The deposit can be released from check-out day.").

## Step 7: tests (Jest + Testing Library, `render-with-providers`)

- **Services:** map list/detail responses, send the right bodies, surface `details.fields`.
- **Bookings page:** filters go into the query, the deposit tab sorts by due date and shows the overdue badge.
- **Detail:** actions appear only with permissions.
  - Cancel needs a reason.
  - Refund caps the amount at the remaining stay balance.
  - The deposit dialog requires a reason when keeping part.
  - Mutations invalidate the right keys.
- **Delete** the tests tied to mock data that no longer exists.

## Order of work

1. Types, services, query keys, hooks.
2. Bookings list (incl. the deposit tab).
3. Booking detail, read-only.
4. Actions: check in, cancel, refund, release deposit, verify.
5. Payments page; replace the refunds page with "Needs refund decision".
6. Unit, property and customer fields.
7. Tests, then remove the mock data and types.
