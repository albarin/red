import { error } from '@sveltejs/kit';

export const load = ({ params }) => {
  if (!params.route) {
    const now = new Date();
    params.route = `${now.getFullYear()}/${now.getMonth() + 1}`;
  }

  const cycleRouteRegex = /^cycle\/([1-9]\d*)$/;
  if (cycleRouteRegex.test(params.route)) {
    return {
      view: 'cycle',
      cycle: Number(params.route.split('/')[1]),
    };
  }

  const monthPattern = /^\d{4}\/(0?[1-9]|1[0-2])$/;
  if (monthPattern.test(params.route)) {
    const [year, month] = params.route.split('/');
    return {
      view: 'month',
      year,
      month,
    };
  }

  throw error(404, 'Not found');
}