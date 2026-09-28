import { mockGuests, mockReservations } from '@/mocks/data';
import type { Review } from '@/shared/types/hospitable';

export const mockReviews: Review[] = [
  {
    id: 'rev-001',
    platform: 'direct',
    public: {
      rating: 5,
      review:
        'Beautiful apartment and seamless check-in. The Lekki location was perfect for our weekend.',
      response: 'Thank you Temitope — delighted you enjoyed Azure Lekki!',
    },
    private: {
      feedback: 'Would book again.',
      detailed_ratings: [
        { type: 'cleanliness', rating: 5, comment: 'Spotless' },
        { type: 'communication', rating: 5, comment: 'Very responsive' },
        { type: 'location', rating: 5, comment: 'Great area' },
        { type: 'checkin', rating: 5, comment: 'Easy' },
        { type: 'accuracy', rating: 5, comment: 'As described' },
        { type: 'value', rating: 4, comment: 'Fair for Lekki' },
      ],
    },
    can_respond: false,
    responded_at: '2026-09-18T12:00:00Z',
    reviewed_at: '2026-09-17T09:30:00Z',
    moderation_status: 'published',
    reservation: mockReservations.find((item) => item.id === 'rsv-007'),
    guest: mockGuests[8],
  },
  {
    id: 'rev-002',
    platform: 'airbnb',
    public: {
      rating: 4,
      review:
        'Lovely penthouse views. Checkout felt a bit rushed, but overall a great stay.',
      response: null,
    },
    private: {
      feedback: 'Noise from nearby construction in the afternoon.',
      detailed_ratings: [
        { type: 'cleanliness', rating: 5, comment: '' },
        { type: 'communication', rating: 4, comment: '' },
        { type: 'location', rating: 5, comment: '' },
        { type: 'checkin', rating: 4, comment: '' },
        { type: 'accuracy', rating: 4, comment: '' },
        { type: 'value', rating: 4, comment: '' },
      ],
    },
    can_respond: true,
    responded_at: null,
    reviewed_at: '2026-09-28T18:00:00Z',
    moderation_status: 'pending',
    reservation: mockReservations.find((item) => item.id === 'rsv-003'),
    guest: mockGuests[2],
  },
  {
    id: 'rev-003',
    platform: 'direct',
    public: {
      rating: 2,
      review: 'Unit was okay but AC was weak in the bedroom.',
      response: null,
    },
    private: {
      feedback: 'Expecting a follow-up on maintenance.',
      detailed_ratings: [
        { type: 'cleanliness', rating: 3, comment: '' },
        { type: 'communication', rating: 3, comment: '' },
        { type: 'location', rating: 4, comment: '' },
        { type: 'checkin', rating: 3, comment: '' },
        { type: 'accuracy', rating: 2, comment: 'AC issue not listed' },
        { type: 'value', rating: 2, comment: '' },
      ],
    },
    can_respond: true,
    responded_at: null,
    reviewed_at: '2026-09-23T14:10:00Z',
    moderation_status: 'hidden',
    reservation: mockReservations.find((item) => item.id === 'rsv-004'),
    guest: mockGuests[3],
  },
  {
    id: 'rev-004',
    platform: 'direct',
    public: {
      rating: 5,
      review: 'Studio was compact, clean, and close to everything in VI.',
      response: null,
    },
    private: {
      feedback: null,
      detailed_ratings: null,
    },
    can_respond: true,
    responded_at: null,
    reviewed_at: '2026-09-20T11:00:00Z',
    moderation_status: 'published',
    reservation: mockReservations.find((item) => item.id === 'rsv-002'),
    guest: mockGuests[1],
  },
];
