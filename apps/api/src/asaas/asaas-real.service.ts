import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as QRCode from 'qrcode';

@Injectable()
export class AsaasRealService {
  private apiUrl: string;
  private apiKey: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get('ASAAS_API_URL') || '';
    this.apiKey = this.configService.get('ASAAS_API_KEY') || '';
    
    if (!this.apiUrl || !this.apiKey) {
      console.warn('⚠️ Asaas API keys não configuradas');
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
    cpfCnpj?: string;
  }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/customers`,
          {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            cpfCnpj: customerData.cpfCnpj,
            notificationDisabled: false,
          },
          { headers: this.getHeaders() },
        ),
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error.response?.data);
      throw new BadRequestException(error.response?.data?.errors?.[0]?.description || 'Erro ao criar cliente');
    }
  }

  async createPayment(data: {
    customerId: string;
    value: number;
    externalReference: string;
    billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
    dueDate?: string;
  }) {
    try {
      const dueDate = data.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/payments`,
          {
            customer: data.customerId,
            billingType: data.billingType,
            value: data.value,
            externalReference: data.externalReference,
            dueDate: dueDate,
          },
          { headers: this.getHeaders() },
        ),
      );

      const payment = response.data;
      let result: any = {
        id: payment.id,
        status: payment.status,
        value: payment.value,
        billingType: payment.billingType,
      };

      if (data.billingType === 'PIX' && payment.pixQrCodePayload) {
        const qrCodeImage = await QRCode.toDataURL(payment.pixQrCodePayload);
        result.qrCode = payment.pixQrCodePayload;
        result.qrCodeImage = qrCodeImage;
      }

      if (data.billingType === 'BOLETO' && payment.bankSlipUrl) {
        result.bankSlipUrl = payment.bankSlipUrl;
        result.bankSlipPdf = payment.bankSlipPdf;
      }

      return result;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error.response?.data);
      throw new BadRequestException(error.response?.data?.errors?.[0]?.description || 'Erro ao criar pagamento');
    }
  }

  async getPaymentStatus(paymentId: string) {
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
}
