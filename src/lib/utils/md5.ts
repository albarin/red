import { Md5 } from 'ts-md5';

export const md5 = (value: any): string => {
  return Md5.hashStr(JSON.stringify(value));
}