export enum DateFilterType {
  Custom = 'custom',
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year',
}

export interface DateFilter {
  key: string;
  type: DateFilterType | `${DateFilterType}`;
  range?: DateRange;
  label?: string;
  text?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}
