import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints/endpoints";
import { ApiResponse } from "@/services/api/types";
import { Transaction, TransactionDetail, PageResponse } from "../types/transaction";

export const transactionService = {
    /**
     * Get all transactions for the current user
     */
    async getTransactions(page: number = 0, size: number = 10, type: string = 'All', status: string = 'All'): Promise<ApiResponse<PageResponse<Transaction>>> {
        let url = `${endpoints.transactions.getTransactions()}?page=${page}&size=${size}`;
        if (type !== 'All') {
            url += `&type=${type.toUpperCase()}`;
        }
        if (status !== 'All') {
            const beStatus = status === 'PAID' ? 'SUCCESS' : status;
            url += `&status=${beStatus}`;
        }
        return apiClient.get<PageResponse<Transaction>>(url);
    },

    /**
     * Get details for a specific transaction
     */
    async getTransactionDetails(id: string): Promise<ApiResponse<TransactionDetail>> {
        return apiClient.get<TransactionDetail>(endpoints.transactions.getTransactionDetails(id));
    },

    /**
     * Verify ticket via QR code
     */
    async verifyTicket(code: string): Promise<ApiResponse<any>> {
        return apiClient.post<any>('/tickets/verify', { code });
    }
};
