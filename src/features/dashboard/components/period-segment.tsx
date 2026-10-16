'use client';

import { SegmentedControl } from '@/shared/components/ui';
import type { ReportPeriod } from '../types';
import { PERIOD_OPTIONS } from '../utils/report-format';

type PeriodSegmentProps = {
  value: ReportPeriod;
  onChange: (period: ReportPeriod) => void;
};

/** 7D / 30D / 90D / 12M switch. */
export function PeriodSegment({ value, onChange }: PeriodSegmentProps) {
  return <SegmentedControl label="Period" options={PERIOD_OPTIONS} value={value} onChange={onChange} />;
}
