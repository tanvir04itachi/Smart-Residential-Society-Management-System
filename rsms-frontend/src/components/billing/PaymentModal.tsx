'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { billingService } from '@/services/billing.service';
import {
  processPaymentSchema,
  type ProcessPaymentFormValues,
} from '@/schemas/billing.schema';
import { PaymentMethod, type Bill } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';

export function PaymentModal({
  bill,
  isOpen,
  onClose,
  onSuccess,
}: {
  bill: Bill;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}) {
  const t = useTranslations('billing');
  const commonT = useTranslations('common');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProcessPaymentFormValues>({
    resolver: zodResolver(processPaymentSchema),
    defaultValues: {
      method: PaymentMethod.BKASH,
      transactionRef: 'DEMO-TXN-0001',
    },
  });

  async function onSubmit(values: ProcessPaymentFormValues) {
    try {
      await billingService.pay(bill.id, values);
      toast.success(t('paymentSuccess'));
      reset();
      await onSuccess();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('payNow')}>
      <div className="mb-4 rounded-md bg-slate-50 p-3 text-sm">
        <p className="text-slate-500">{commonT('amount')}</p>
        <p className="text-lg font-semibold text-slate-900">
          {formatCurrency(bill.totalAmount)}
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select
          label={t('paymentMethod')}
          options={Object.values(PaymentMethod).map((m) => ({
            value: m,
            label: t(m),
          }))}
          error={errors.method?.message}
          {...register('method')}
        />
        <Input
          label={t('transactionRef')}
          placeholder="e.g. TXN123456"
          hint={t('transactionRefHint')}
          error={errors.transactionRef?.message}
          {...register('transactionRef')}
        />
        <Button type="submit" isLoading={isSubmitting}>
          {t('payNow')}
        </Button>
      </form>
    </Modal>
  );
}
