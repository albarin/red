export const arrayToObject = (array: any[], keyField: string) =>
  array.reduce((obj, item) => {
    obj[item[keyField]] = item;
    return obj;
  }, {});