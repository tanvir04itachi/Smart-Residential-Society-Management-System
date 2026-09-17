import { FlatDetailClient } from '@/components/flats/FlatDetailClient';

export default async function FlatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FlatDetailClient id={id} />;
}
