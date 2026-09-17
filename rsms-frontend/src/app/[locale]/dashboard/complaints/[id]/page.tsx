import { ComplaintDetailClient } from '@/components/complaints/ComplaintDetailClient';

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ComplaintDetailClient id={id} />;
}
