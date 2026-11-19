import { CellObject, utils, writeXLSX } from 'xlsx';

type Locale = 'de' | 'en';

interface CellConfig {
  type: 'datetime' | 'duration' | 'number' | 'string';
  width?: number;
}

const localeFormats: Record<Locale, Record<string, string>> = {
  de: {
    datetime: 'dd.mm.yyyy hh:mm:ss',
    duration: '[hh]:mm:ss',
  },
  en: {
    datetime: 'yyyy-mm-dd hh:mm:ss',
    duration: '[hh]:mm:ss',
  },
};

const cellConfigs: Record<string, CellConfig> = {
  start: { type: 'datetime', width: 20 },
  end: { type: 'datetime', width: 20 },
  duration: { type: 'duration', width: 12 },
  notes: { type: 'string', width: 40 },
  user: { type: 'string', width: 15 },
  type: { type: 'string', width: 15 },
  project: { type: 'string', width: 20 },
};

export function toXLSXBlob(content: string): Blob {
  return new Blob([content], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function generateXLSX<T extends Record<string, unknown> = Record<string, unknown>>(
  keys: (keyof T)[],
  data: T[],
  labels?: Record<keyof T, string>,
  locale: Locale = 'en',
): string {
  const workbook = utils.book_new();

  const worksheet = utils.json_to_sheet(
    data.map(item => convertDataToCell(item as Record<string, unknown>, locale)),
    {
      header: keys as string[],
    },
  );

  applyColumnWidths(worksheet, keys as string[]);

  const translatedLabels = keys.map(key => labels?.[key] || String(key));
  utils.sheet_add_aoa(worksheet, [translatedLabels], {
    origin: 'A1',
  });

  freezeHeaderRow(worksheet);

  utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const xlsxData = writeXLSX(workbook, { bookType: 'xlsx', type: 'buffer' });

  return xlsxData;
}

function convertDataToCell(
  value: Record<string, unknown>,
  locale: Locale = 'en',
): Record<string, CellObject> {
  const formats = localeFormats[locale] ?? localeFormats.en;
  const cell: Record<string, CellObject> = {};

  for (const key in value) {
    const cellValue = value[key];
    const config = cellConfigs[key] ?? { type: 'string' };

    switch (config.type) {
      case 'datetime':
        cell[key] = {
          t: 'd',
          v: cellValue as Date | string,
          z: formats['datetime'],
        } as CellObject;
        break;

      case 'duration':
        cell[key] = {
          t: 'n',
          v: typeof cellValue === 'number' ? cellValue / 86400000 : 0,
          z: formats['duration'],
        };
        break;

      case 'number':
        cell[key] = {
          t: 'n',
          v: typeof cellValue === 'number' ? cellValue : 0,
        };
        break;

      default:
        cell[key] = {
          t: 's',
          v: String(cellValue || ''),
        };
    }
  }

  return cell;
}

function applyColumnWidths(worksheet: any, keys: string[]): void {
  worksheet['!cols'] = keys.map(key => ({
    wch: cellConfigs[key]?.width ?? 15,
  }));
}

function freezeHeaderRow(worksheet: any): void {
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
}
