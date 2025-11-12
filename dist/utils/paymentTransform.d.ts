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
export declare function transformPaymentMethod(input: PaymentMethodInput): PaymentMethodOutput;
//# sourceMappingURL=paymentTransform.d.ts.map