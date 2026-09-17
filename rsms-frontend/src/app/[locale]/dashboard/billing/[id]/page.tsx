import { BillDetailClient } from '@/components/billing/BillDetailClient';

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BillDetailClient id={id} />;
}
