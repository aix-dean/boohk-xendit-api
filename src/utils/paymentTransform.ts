export interface PaymentMethodInput {
  type: string;
  bankCode?: string;
  ewalletType?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardholderName?: string;
  accountNumber?: string;
  reusability?: string;
  customerName?: string;
}

export interface PaymentMethodOutput {
  type: string;
  reusability: string;
  virtual_account?: {
    channel_code: string;
    channel_properties: {
      customer_name: string;
      virtual_account_number?: string;
      expires_at?: Date;
      suggested_amount?: number;
    };
  };
  ewallet?: {
    channel_code: string;
    channel_properties?: {
      success_return_url?: string;
      failure_return_url?: string;
    };
  };
  card?: {
    channel_properties: {
      success_return_url?: string;
      failure_return_url?: string;
      skip_three_d_secure?: boolean;
    };
    card_information: {
      card_number: string;
      expiry_month: string;
      expiry_year: string;
      cvv: string;
      cardholder_name?: string;
    };
  };
  direct_debit?: {
    channel_code: string;
    account_number: string;
  };
}

export function transformPaymentMethod(input: PaymentMethodInput): PaymentMethodOutput {
  switch (input.type) {
    case 'VIRTUAL_ACCOUNT':
      if (!input.bankCode) {
        throw new Error('bankCode is required for VIRTUAL_ACCOUNT');
      }
      return {
        type: 'VIRTUAL_ACCOUNT',
        reusability: input.reusability || 'ONE_TIME_USE',
        virtual_account: {
          channel_code: input.bankCode,
          channel_properties: {
            customer_name: input.customerName || 'Customer',
          },
        },
      };
    case 'EWALLET':
      if (!input.ewalletType) {
        throw new Error('ewalletType is required for EWALLET');
      }
      return {
        type: 'EWALLET',
        reusability: 'ONE_TIME_USE',
        ewallet: {
          channel_code: input.ewalletType,
          channel_properties: {},
        },
      };
    case 'CARD':
      if (!input.cardNumber || !input.expiryMonth || !input.expiryYear || !input.cvv) {
        throw new Error('cardNumber, expiryMonth, expiryYear, cvv are required for CARD');
      }
      return {
        type: 'CARD',
        reusability: 'ONE_TIME_USE',
        card: {
          channel_properties: {},
          card_information: {
            card_number: input.cardNumber,
            expiry_month: input.expiryMonth,
            expiry_year: input.expiryYear,
            cvv: input.cvv,
            ...(input.cardholderName && { cardholder_name: input.cardholderName }),
          },
        },
      };
    case 'DIRECT_DEBIT':
      if (!input.accountNumber || !input.bankCode) {
        throw new Error('accountNumber and bankCode are required for DIRECT_DEBIT');
      }
      return {
        type: 'DIRECT_DEBIT',
        reusability: 'ONE_TIME_USE',
        direct_debit: {
          channel_code: `${input.bankCode}_MOBILE`,
          account_number: input.accountNumber,
        },
      };
    case 'QR_CODE':
    case 'PAYLATER':
      return {
        type: input.type,
        reusability: 'ONE_TIME_USE'
      };
    default:
      throw new Error(`Unsupported payment method type: ${input.type}`);
  }
}