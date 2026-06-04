import type { BadgeVariant } from '@/components/ui/Badge'

export interface StatusInfo {
  label: string
  variant: BadgeVariant
  step: number          // posição na timeline (-1 = cancelado/reembolsado)
  cancellable: boolean  // cliente pode cancelar neste status?
}

export const ORDER_STATUS: Record<string, StatusInfo> = {
  PENDING:          { label: 'Pendente',             variant: 'pending',    step: 0, cancellable: true  },
  AWAITING_PAYMENT: { label: 'Ag. Pagamento',        variant: 'waiting',    step: 0, cancellable: true  },
  PAID:             { label: 'Pago',                 variant: 'paid',       step: 1, cancellable: true  },
  PROCESSING:       { label: 'Em Processamento',     variant: 'processing', step: 1, cancellable: true  },
  SHIPPED:          { label: 'Enviado',              variant: 'shipped',    step: 2, cancellable: false },
  DELIVERED:        { label: 'Entregue',             variant: 'delivered',  step: 3, cancellable: false },
  CANCELLED:        { label: 'Cancelado',            variant: 'cancelled',  step: -1, cancellable: false },
  REFUNDED:         { label: 'Reembolsado',          variant: 'refunded',   step: -1, cancellable: false },
}

export function getStatusInfo(status: string): StatusInfo {
  return ORDER_STATUS[status] ?? { label: status, variant: 'light', step: -1, cancellable: false }
}
