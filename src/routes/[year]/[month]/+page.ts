import { error } from '@sveltejs/kit';

export const load = ({ params }: { params: { month: number, year: number } }) => {
  if (params.year && params.month) {
    return {
      month: params.month,
      year: params.year,
    };
  }

  throw error(404, 'Not found');
}