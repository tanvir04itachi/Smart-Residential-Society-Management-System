import { BookAmenityClient } from '@/components/amenities/BookAmenityClient';

export default async function BookAmenityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookAmenityClient id={id} />;
}
