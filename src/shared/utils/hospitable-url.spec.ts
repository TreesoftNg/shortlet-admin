import { canBlockInHospitable, isHospitableUrl } from './hospitable-url';
describe('Hospitable links', () => {
  it.each(['pending_payment', 'confirmed', 'checked_in'])(
    'shows links for %s',
    (status) =>
      expect(
        canBlockInHospitable('https://my.hospitable.com/calendar', status),
      ).toBe(true),
  );
  it.each(['cancelled', 'expired', 'completed'])(
    'hides links for %s',
    (status) =>
      expect(
        canBlockInHospitable('https://my.hospitable.com/calendar', status),
      ).toBe(false),
  );
  it.each([
    'http://my.hospitable.com',
    'https://hospitable.com.evil.test',
    'javascript:alert(1)',
  ])('rejects %s', (url) => expect(isHospitableUrl(url)).toBe(false));
  it('hides units without a configured link', () =>
    expect(canBlockInHospitable(null)).toBe(false));
});
