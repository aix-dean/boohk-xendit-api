"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformPaymentMethod = transformPaymentMethod;
function transformPaymentMethod(input) {
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
//# sourceMappingURL=paymentTransform.js.map