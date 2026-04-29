import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as QRCode from 'qrcode';

@Injectable()
export class AsaasService {
  private apiUrl: string;
  private apiKey: string;
  private isSimulated: boolean = false;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('ASAAS_API_URL') || '';
    this.apiKey = this.configService.get<string>('ASAAS_API_KEY') || '';
    
    if (!this.apiUrl || !this.apiKey) {
      console.warn('⚠️ Asaas API keys não configuradas. Usando modo SIMULADO.');
      this.isSimulated = true;
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'access_token': this.apiKey,
    };
  }

  async createCustomer(customerData: {
    name: string;
    email?: string;
    phone: string;
  }) {
    if (this.isSimulated) {
      // Retornar ID simulado
      return { id: `sim_cust_${Date.now()}` };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/customers`,
          {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            notificationDisabled: false,
          },
          { headers: this.getHeaders() },
        ),
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente no Asaas:', error.response?.data);
      throw new BadRequestException('Erro ao criar cliente no Asaas');
    }
  }

  async createPixPayment(data: {
    customerId: string;
    value: number;
    externalReference: string;
  }) {
    if (this.isSimulated) {
      // Gerar QR Code simulado
      const simulatedPayload = `00020126360014br.gov.bcb.pix0111simulado.com5204000053039865404${Math.round(data.value * 100)}5802BR5913Cliente Simulado6009SAO PAULO62070503***6304FAKE`;
      const qrCodeImage = await QRCode.toDataURL(simulatedPayload);
      
      return {
        id: `sim_pay_${Date.now()}`,
        qrCode: simulatedPayload,
        qrCodeImage: qrCodeImage,
        status: 'PENDING',
        value: data.value,
      };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/payments`,
          {
            customer: data.customerId,
            billingType: 'PIX',
            value: data.value,
            externalReference: data.externalReference,
            dueDate: new Date().toISOString().split('T')[0],
          },
          { headers: this.getHeaders() },
        ),
      );

      const payment = response.data;
      let qrCodeImage = '';
      if (payment.pixQrCodePayload) {
        qrCodeImage = await QRCode.toDataURL(payment.pixQrCodePayload);
      }

      return {
        id: payment.id,
        qrCode: payment.pixQrCodePayload || '',
        qrCodeImage: qrCodeImage,
        status: payment.status,
        value: payment.value,
      };
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error.response?.data);
      throw new BadRequestException('Erro ao criar pagamento PIX');
    }
  }

  async getPaymentStatus(paymentId: string) {
    if (this.isSimulated) {
      return {
        id: paymentId,
        status: 'PENDING',
        billingType: 'PIX',
        value: 100,
      };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/payments/${paymentId}`, {
          headers: this.getHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar pagamento:', error.response?.data);
      throw new BadRequestException('Erro ao consultar pagamento');
    }
  }

  async webhookHandler(payload: any) {
    const { event, payment } = payload;

    if (event === 'PAYMENT_RECEIVED') {
      return {
        status: 'paid',
        paymentId: payment.id,
        value: payment.value,
        externalReference: payment.externalReference,
      };
    }

    if (event === 'PAYMENT_OVERDUE') {
      return {
        status: 'overdue',
        paymentId: payment.id,
        externalReference: payment.externalReference,
      };
    }

    return null;
  }
}
