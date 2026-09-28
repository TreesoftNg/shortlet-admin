import { getEventBarStyles, getLegendSwatchStyles } from './calendar-legend';

describe('calendar event styles', () => {
  it('maps confirmed and blocked styles', () => {
    expect(getEventBarStyles('confirmed').bg).toBe('brand.500');
    expect(getEventBarStyles('blocked').borderColor).toBe('#DDDDD8');
    expect(getLegendSwatchStyles('external').bg).toBe('status.info');
  });
});
