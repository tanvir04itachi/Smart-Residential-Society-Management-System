import { ResidentDetailClient } from '@/components/residents/ResidentDetailClient';

export default async function ResidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResidentDetailClient id={id} />;
}
