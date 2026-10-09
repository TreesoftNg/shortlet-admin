'use client';

import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Panel } from '@/shared/components/ui';
import type { RevenuePoint } from '../types';
import { axisTicks, formatAmount, formatCompactAmount } from '../utils/report-format';
import { buildAreaPath, buildSmoothLinePath, chartPadding, mapPointsToChart } from '../utils/revenue-chart';

type RevenueOverviewProps = {
  points: RevenuePoint[];
  currency: string;
  /** e.g. "Last 30 days · 10 Sept – 9 Oct 2026" */
  subtitle?: string;
};

const MIN_CHART_WIDTH = 320;
const MIN_CHART_HEIGHT = 260;
const MAX_CHART_HEIGHT = 320;
const FONT = 'Plus Jakarta Sans, system-ui, sans-serif';

/** Revenue for the period as a line, with the previous period dashed behind it. */
export function RevenueOverview({ points, currency, subtitle }: RevenueOverviewProps) {
  const chartHostRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(MIN_CHART_WIDTH);
  const [chartHeight, setChartHeight] = useState(MIN_CHART_HEIGHT);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const node = chartHostRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextWidth = Math.max(MIN_CHART_WIDTH, Math.floor(entry.contentRect.width));
      const nextHeight = Math.min(MAX_CHART_HEIGHT, Math.max(MIN_CHART_HEIGHT, Math.floor(entry.contentRect.height)));
      setChartWidth((current) => (current === nextWidth ? current : nextWidth));
      setChartHeight((current) => (current === nextHeight ? current : nextHeight));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const chart = useMemo(() => {
    const largest = Math.max(0, ...points.map((point) => Math.max(point.amount, point.previousAmount)));
    const ticks = axisTicks(largest);
    const ceiling = ticks[3] || 1;
    const current = mapPointsToChart(points, chartWidth, chartHeight, chartPadding, ceiling);
    const previous = mapPointsToChart(
      points.map((point) => ({ ...point, amount: point.previousAmount })),
      chartWidth,
      chartHeight,
      chartPadding,
      ceiling,
    );
    const bestIndex = points.reduce((best, point, index) => (point.amount > points[best].amount ? index : best), 0);
    return {
      ticks,
      current,
      linePath: buildSmoothLinePath(current),
      areaPath: buildAreaPath(current, chartHeight, chartPadding),
      previousPath: buildSmoothLinePath(previous),
      defaultIndex: points.length ? bestIndex : null,
      isEmpty: largest === 0,
    };
  }, [chartHeight, chartWidth, points]);

  const activeIndex = hoverIndex ?? chart.defaultIndex;
  const activePoint = activeIndex === null ? undefined : chart.current[activeIndex];
  const activeData = activeIndex === null ? undefined : points[activeIndex];
  const plotBottom = chartHeight - chartPadding.bottom;
  const plotHeight = plotBottom - chartPadding.top;
  const step = Math.ceil(points.length / 6);
  const xLabelIndexes = points
    .map((_, index) => index)
    .filter((index) => points.length <= 6 || index % step === 0 || index === points.length - 1);

  const onPointerMove = (event: MouseEvent<SVGSVGElement>) => {
    if (!chart.current.length) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * chartWidth;
    const nearest = chart.current.reduce(
      (best, point, index) => (Math.abs(point.x - x) < Math.abs(chart.current[best].x - x) ? index : best),
      0,
    );
    setHoverIndex(nearest);
  };

  return (
    <Panel h="100%" display="flex" flexDirection="column" minH="0">
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        gap="10px"
        mb="16px"
        flexShrink={0}
      >
        <Box>
          <Heading as="h3" fontSize="18px" fontWeight={700}>
            Revenue overview
          </Heading>
          {subtitle ? (
            <Text fontSize="13px" color="ink.300" mt="2px">
              {subtitle}
            </Text>
          ) : null}
        </Box>
        <Flex gap="14px" fontSize="12px" color="ink.400" fontWeight={600}>
          <Flex align="center" gap="6px">
            <Box w="14px" h="3px" borderRadius="2px" bg="#0E7C6B" />
            This period
          </Flex>
          <Flex align="center" gap="6px">
            <Box w="14px" borderTop="2px dashed #C9CDD0" />
            Previous period
          </Flex>
        </Flex>
      </Flex>

      <Box
        ref={chartHostRef}
        position="relative"
        flex="1"
        minH={`${MIN_CHART_HEIGHT}px`}
        maxH={`${MAX_CHART_HEIGHT}px`}
        w="100%"
        overflow="hidden"
      >
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          width="100%"
          height="100%"
          role="img"
          aria-label="Revenue overview chart"
          onMouseMove={onPointerMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#0E7C6B" stopOpacity="0.22" />
              <stop offset="1" stopColor="#0E7C6B" stopOpacity="0" />
            </linearGradient>
          </defs>

          {chart.ticks.map((tick, row) => {
            const y = plotBottom - (row / 3) * plotHeight;
            return (
              <g key={row}>
                <line x1={chartPadding.left} x2={chartWidth} y1={y} y2={y} stroke="#F0F0EC" strokeWidth="1" />
                <text x="0" y={y + 4} fontSize="11" fill="#80868C" fontFamily={FONT}>
                  {formatCompactAmount(tick, currency)}
                </text>
              </g>
            );
          })}

          {xLabelIndexes.map((index) => {
            const point = chart.current[index];
            if (!point) return null;
            const anchor = index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle';
            return (
              <text
                key={points[index].date}
                x={point.x}
                y={chartHeight - 10}
                fontSize="11"
                fill="#80868C"
                fontFamily={FONT}
                textAnchor={anchor}
              >
                {points[index].label}
              </text>
            );
          })}

          {chart.areaPath ? <path d={chart.areaPath} fill="url(#revenueFill)" /> : null}
          {chart.previousPath ? (
            <path d={chart.previousPath} fill="none" stroke="#C9CDD0" strokeWidth="2" strokeDasharray="5 6" />
          ) : null}
          {chart.linePath ? (
            <path d={chart.linePath} fill="none" stroke="#0E7C6B" strokeWidth="3" strokeLinecap="round" />
          ) : null}

          {activePoint && activeData && !chart.isEmpty ? (
            <>
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1={activePoint.y}
                y2={plotBottom}
                stroke="#1B1D1F"
                strokeDasharray="3 4"
              />
              <circle cx={activePoint.x} cy={activePoint.y} r="6" fill="#fff" stroke="#0E7C6B" strokeWidth="3" />
              <g
                transform={`translate(${Math.min(Math.max(activePoint.x - 80, 8), chartWidth - 168)}, ${Math.max(
                  activePoint.y - 72,
                  8,
                )})`}
              >
                <rect width="160" height="58" rx="10" fill="#1B1D1F" />
                <text x="12" y="18" fontSize="11" fill="#A9AEB2" fontFamily={FONT}>
                  {activeData.label}
                </text>
                <text x="12" y="35" fontSize="14" fontWeight="800" fill="#fff" fontFamily={FONT}>
                  {formatAmount(activeData.amount, currency)}
                </text>
                <text x="12" y="50" fontSize="11" fill="#A9AEB2" fontFamily={FONT}>
                  Before: {formatAmount(activeData.previousAmount, currency)}
                </text>
              </g>
            </>
          ) : null}
        </svg>
        {chart.isEmpty ? (
          <Flex position="absolute" inset="0" align="center" justify="center" pointerEvents="none">
            <Text fontSize="14px" color="ink.300" bg="white" px="12px" py="6px" borderRadius="10px">
              No revenue in this period yet
            </Text>
          </Flex>
        ) : null}
      </Box>
    </Panel>
  );
}
