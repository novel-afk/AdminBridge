import { FC } from 'react';

export interface Column {
  header: string;
  accessor: string;
  render?: (row: any) => JSX.Element;
}

export interface DataTableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  error?: string;
}

export const DataTable: FC<DataTableProps>;
