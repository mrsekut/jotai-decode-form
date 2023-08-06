import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// ISO8601 (UTC)
export type UTC = z.infer<typeof UTC>;
export const UTC = z.string().datetime().brand<'UTC'>();

export const mkUTC = (utc: string): UTC => {
  return UTC.parse(utc);
};

export const toJSTFormat = (utc: UTC, template: string): string => {
  return dayjs(utc).tz('Asia/Tokyo').format(template);
};

type DatetimeLocalJST = z.infer<typeof DatetimeLocalJST>;
export const DatetimeLocalJST = z.string().refine(datetimeLocal => {
  // YYYY-MM-DDTHH:mm
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  return regex.test(datetimeLocal);
});
export const datetimeLocalJST2UTC = (datetimeLocal: DatetimeLocalJST): UTC => {
  return mkUTC(dayjs(datetimeLocal).tz('Asia/Tokyo').utc().format());
};
