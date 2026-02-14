export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'CANCELLED' | 'FAILED';
export type TransactionType = 'EVENT' | 'WORKSHOP';

export interface Transaction {
    id: string;
    amount: number;
    status: TransactionStatus;
    transactionDate: string;
    orderId: string;
    type: TransactionType;
}

export interface Ticket {
    id: string;
    ticketCode: string;
    qrCode: string;
    ticketType: TransactionType;
    status: string; // 'ACTIVE', etc.
    itemName: string;
    validFrom: string;
    validTo: string;
}

export interface TransactionDetail extends Transaction {
    description?: string;
    tickets: Ticket[];
}
