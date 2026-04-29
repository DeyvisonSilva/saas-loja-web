export class CreatePaymentDto {
  orderId: string;
  tenantId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  value: number;
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  dueDate?: string;
}

export class PaymentResponseDto {
  id: string;
  qrCode?: string;
  qrCodeImage?: string;
  bankSlipUrl?: string;
  status: string;
  value: number;
}
