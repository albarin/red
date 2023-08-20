import { redirect } from '@sveltejs/kit';

export const GET = ({ params }: { params: { month: number, year: number } }) => {
  if (Object.keys(params).length === 0) {
    const now = new Date();
    throw redirect(303, `/${now.getFullYear()}/${now.getMonth() + 1}`)
  }
}