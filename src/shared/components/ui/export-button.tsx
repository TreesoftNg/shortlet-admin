'use client';

import { Button, type ButtonProps } from '@chakra-ui/react';
import { useState } from 'react';
import { LuDownload } from 'react-icons/lu';
import {
  exportRowsAsCsv,
  type CsvColumn,
} from '@/shared/utils/export-csv';

export type ExportButtonProps<T> = Omit<ButtonProps, 'onClick' | 'children'> & {
  /** Download filename (`.csv` appended when missing). */
  filename: string;
  columns: CsvColumn<T>[];
  rows: T[];
  label?: string;
};

/** Reusable CSV export control used on list/report pages. */
export function ExportButton<T>({
  filename,
  columns,
  rows,
  label = 'Export',
  isDisabled,
  leftIcon,
  variant = 'secondary',
  ...rest
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false);
  const disabled = isDisabled || rows.length === 0 || columns.length === 0;

  const handleExport = () => {
    if (disabled || isExporting) return;
    setIsExporting(true);
    try {
      exportRowsAsCsv(filename, rows, columns);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      leftIcon={leftIcon ?? <LuDownload size={16} />}
      isDisabled={disabled}
      isLoading={isExporting}
      loadingText={label}
      onClick={handleExport}
      {...rest}
    >
      {label}
    </Button>
  );
}
