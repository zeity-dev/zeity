import { utils, writeXLSX } from 'xlsx';

export function toXLSXBlob(content: string): Blob {
  return new Blob([content], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function generateXLSX<T = Record<string, unknown>>(
  keys: (keyof T)[],
  data: T[],
  labels?: Record<keyof T, string>
): string {
  const workbook = utils.book_new();

  const worksheet = utils.json_to_sheet(
    data.map((item) => convertDataToCell(item)),
    {
      header: keys as string[],
    }
  );

  worksheet['!cols'] = keys.map((key) => getColumnSetting(key as string));

  const translatedLabels = keys.map((key) => labels?.[key] || key);

  utils.sheet_add_aoa(worksheet, [translatedLabels], {
    origin: 'A1',
  });

  utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const xlsxData = writeXLSX(workbook, { bookType: 'xlsx', type: 'buffer' });

  return xlsxData;
}

function convertDataToCell<T = Record<string, unknown>>(value: T) {
  const cell: Record<string, unknown> = {};

  for (const key in value) {
    const cellValue = value[key];
    switch (key) {
      case 'start':
      case 'end':
        cell[key] = {
          t: 'd',
          v: cellValue,
        };
        break;
      case 'duration':
        // Expected: cellValue is the duration in milliseconds
        // Excel expects days: 1 day = 86400000 ms
        cell[key] = {
          t: 'n', // number type
          v: typeof cellValue === 'number' ? cellValue / 86400000 : 0,
          z: '[hh]:mm:ss',
        };
        break;
      default:
        cell[key] = { t: 's', v: cellValue || '' };
    }
  }

  return cell;
}

function getColumnSetting(key: string) {
  switch (key) {
    case 'duration':
      return { wch: 12 };
    case 'notes':
      return { wch: 40 };
    default:
      return { wch: 15 };
  }
}
