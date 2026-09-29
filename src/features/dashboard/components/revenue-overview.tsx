'use client';

import { Box, Flex, Heading, useBreakpointValue } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Panel } from '@/shared/components/ui';
import type { RevenueOverview as RevenueOverviewData, RevenuePeriod } from '@/shared/types/hospitable';
import {
  buildAreaPath,
  buildSmoothLinePath,
  chartPadding,
  findHighlightIndex,
  getSeriesExtent,
  mapPointsToChart,
} from '../utils/revenue-chart';
import { PeriodSegment } from './period-segment';

type RevenueOverviewProps = {
  data: RevenueOverviewData;
  /** Controlled period — when set, hides the internal period control. */
  period?: RevenuePeriod;
  onPeriodChange?: (period: RevenuePeriod) => void;
  showPeriodControl?: boolean;
};

const MIN_CHART_HEIGHT = 260;

export function RevenueOverview({
  data,
  period: controlledPeriod,
  onPeriodChange,
  showPeriodControl = true,
}: RevenueOverviewProps) {
  const [internalPeriod, setInternalPeriod] = useState<RevenuePeriod>(
    data.highlight?.period ?? '30d',
  );
  const period = controlledPeriod ?? internalPeriod;
  const setPeriod = (next: RevenuePeriod) => {
    onPeriodChange?.(next);
    if (controlledPeriod === undefined) {
      setInternalPeriod(next);
    }
  };
  const chartWidth =
    useBreakpointValue({
      base: 360,
      sm: 480,
      md: 560,
      lg: 640,
      xl: 720,
    }) ?? 720;

  const chartHostRef = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState(MIN_CHART_HEIGHT);

  useEffect(() => {
    const node = chartHostRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextHeight = Math.max(
        MIN_CHART_HEIGHT,
        Math.floor(entry.contentRect.height),
      );
      setChartHeight((current) =>
        current === nextHeight ? current : nextHeight,
      );
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const series = data.series[period];
  const highlightDate =
    data.highlight?.period === period ? data.highlight.date : undefined;

  const chart = useMemo(() => {
    const comparison = data.comparison_series?.[period] ?? [];
    const primaryExtent = getSeriesExtent([...series, ...comparison]);
    const primary = mapPointsToChart(
      series,
      chartWidth,
      chartHeight,
      chartPadding,
      primaryExtent.max,
    );
    const secondary = mapPointsToChart(
      comparison,
      chartWidth,
      chartHeight,
      chartPadding,
      primaryExtent.max,
    );
    const highlightIndex = findHighlightIndex(series, highlightDate);
    const highlightPoint = primary[highlightIndex];

    return {
      primary,
      secondary,
      linePath: buildSmoothLinePath(primary),
      areaPath: buildAreaPath(primary, chartHeight, chartPadding),
      comparisonPath: buildSmoothLinePath(secondary),
      highlightPoint,
      highlightLabel:
        data.highlight?.period === period
          ? data.highlight
          : highlightPoint
            ? {
                date: highlightPoint.date,
                formatted_amount: new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: data.currency,
                  maximumFractionDigits: 0,
                }).format(highlightPoint.amount),
              }
            : null,
    };
  }, [
    chartHeight,
    chartWidth,
    data.comparison_series,
    data.currency,
    data.highlight,
    highlightDate,
    period,
    series,
  ]);

  const xLabels = series.filter((_, index) => {
    if (series.length <= 5) return true;
    const step = Math.ceil(series.length / 5);
    return index % step === 0 || index === series.length - 1;
  });

  return (
    <Panel h="100%" display="flex" flexDirection="column" minH="0">
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        gap="12px"
        mb="16px"
        flexShrink={0}
      >
        <Box>
          <Heading as="h3" fontSize="18px" fontWeight={700}>
            Revenue overview
          </Heading>
        </Box>
        {showPeriodControl ? (
          <PeriodSegment value={period} onChange={setPeriod} />
        ) : null}
      </Flex>

      <Box
        ref={chartHostRef}
        flex="1"
        minH={`${MIN_CHART_HEIGHT}px`}
        w="100%"
        overflowX="auto"
        overflowY="hidden"
      >
        <Box minW={{ base: '360px', md: '100%' }} h="100%">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            width="100%"
            height="100%"
            role="img"
            aria-label="Revenue overview chart"
          >
            <defs>
              <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#0E7C6B" stopOpacity="0.22" />
                <stop offset="1" stopColor="#0E7C6B" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 1, 2, 3].map((row) => {
              const y =
                chartPadding.top +
                (row / 3) *
                  (chartHeight - chartPadding.top - chartPadding.bottom);
              return (
                <g key={row}>
                  <line
                    x1={chartPadding.left}
                    x2={chartWidth}
                    y1={y}
                    y2={y}
                    stroke="#F0F0EC"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y={y + 4}
                    fontSize="11"
                    fill="#80868C"
                    fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                  >
                    {data.y_axis_labels[row]}
                  </text>
                </g>
              );
            })}

            {xLabels.map((point) => {
              const index = series.findIndex((item) => item.date === point.date);
              const x =
                chartPadding.left +
                (index / Math.max(series.length - 1, 1)) *
                  (chartWidth - chartPadding.left - chartPadding.right);

              return (
                <text
                  key={point.date}
                  x={x}
                  y={chartHeight - 10}
                  fontSize="11"
                  fill="#80868C"
                  fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                >
                  {point.label}
                </text>
              );
            })}

            {chart.areaPath ? (
              <path d={chart.areaPath} fill="url(#revenueFill)" />
            ) : null}
            {chart.comparisonPath ? (
              <path
                d={chart.comparisonPath}
                fill="none"
                stroke="#C9CDD0"
                strokeWidth="2"
                strokeDasharray="5 6"
              />
            ) : null}
            {chart.linePath ? (
              <path
                d={chart.linePath}
                fill="none"
                stroke="#0E7C6B"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ) : null}

            {chart.highlightPoint ? (
              <>
                <line
                  x1={chart.highlightPoint.x}
                  x2={chart.highlightPoint.x}
                  y1={chart.highlightPoint.y}
                  y2={chartHeight - chartPadding.bottom}
                  stroke="#1B1D1F"
                  strokeDasharray="3 4"
                />
                <circle
                  cx={chart.highlightPoint.x}
                  cy={chart.highlightPoint.y}
                  r="6"
                  fill="#fff"
                  stroke="#0E7C6B"
                  strokeWidth="3"
                />
                {chart.highlightLabel ? (
                  <g
                    transform={`translate(${Math.min(
                      Math.max(chart.highlightPoint.x - 70, 8),
                      chartWidth - 148,
                    )}, ${Math.max(chart.highlightPoint.y - 58, 8)})`}
                  >
                    <rect width="140" height="44" rx="10" fill="#1B1D1F" />
                    <text
                      x="12"
                      y="18"
                      fontSize="11"
                      fill="#A9AEB2"
                      fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                    >
                      {
                        series.find(
                          (p) => p.date === chart.highlightPoint?.date,
                        )?.label
                      }
                    </text>
                    <text
                      x="12"
                      y="35"
                      fontSize="14"
                      fontWeight="800"
                      fill="#fff"
                      fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                    >
                      {chart.highlightLabel.formatted_amount}
                    </text>
                  </g>
                ) : null}
              </>
            ) : null}
          </svg>
        </Box>
      </Box>
    </Panel>
  );
}
