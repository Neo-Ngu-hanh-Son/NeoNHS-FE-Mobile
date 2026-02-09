import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import { ApiResponse } from "@/services/api/types";
import { Transaction, TransactionDetail } from "../types/transaction";

export const transactionService = {
    /**
     * Get all transactions for the current user
     */
    async getTransactions(): Promise<ApiResponse<Transaction[]>> {
        return apiClient.get<Transaction[]>(endpoints.transactions.getTransactions());
    },

    /**
     * Get details for a specific transaction
     */
    async getTransactionDetails(id: string): Promise<ApiResponse<TransactionDetail>> {
        return apiClient.get<TransactionDetail>(endpoints.transactions.getTransactionDetails(id));
    }
};
