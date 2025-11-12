export declare const createPaymentRequest: (params: {
    data: any;
}) => Promise<any>;
export declare const getPaymentRequestByID: (params: {
    paymentRequestId: string;
}) => Promise<any>;
export declare const createInvoice: (params: {
    data: any;
}) => Promise<any>;
export declare const getInvoice: (params: {
    invoiceId: string;
}) => Promise<any>;
export declare const createCustomer: (params: {
    data: any;
}) => Promise<any>;
export declare const getCustomer: (params: {
    customerId: string;
}) => Promise<any>;
export declare const createRefund: (params: {
    data: any;
}) => Promise<any>;
export declare const getRefund: (params: {
    refundID: string;
}) => Promise<any>;
export declare const createPayout: (params: {
    data: any;
    idempotencyKey?: string;
}) => Promise<any>;
export declare const getPayout: (params: {
    payoutID: string;
}) => Promise<any>;
export declare const refundClient: {
    createRefund: (params: {
        data: any;
    }) => Promise<any>;
    getRefund: (params: {
        refundID: string;
    }) => Promise<any>;
};
export declare const payoutClient: {
    createPayout: (params: {
        data: any;
        idempotencyKey?: string;
    }) => Promise<any>;
    getPayout: (params: {
        payoutID: string;
    }) => Promise<any>;
};
//# sourceMappingURL=xendit.d.ts.map