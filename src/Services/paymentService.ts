import axiosInstance from "../lib/axiosInstance";


export interface IFeeStructurePayload {
  classId: string;
  feeHeadId: string;
  amount: number;
}

export interface IGenerateMonthlyInvoicesPayload {
  dueDate: string;
}

export interface ICreateInvoicePayload {
  studentId: string;
  amount: number;
  dueDate: string;
}

export interface ICollectPaymentPayload {
  invoiceId: string;
  amount: number;
  method: "CASH" | "BKASH" | "NAGAD" | "BANK";
  transactionId?: string;
  receiptUrl?: string;
}

export interface IApprovePaymentPayload {
  transactionId: string;
  status: "APPROVED" | "REJECTED";
  note?: string;
}

export const paymentService = {
  // 1. Set/Update Class Fee Structure (Admin)
  setFeeStructure: async (payload: IFeeStructurePayload) => {
    const response = await axiosInstance.post("/payments/fee-structure", payload);
    return response.data;
  },

  // 2. Bulk Monthly Invoice Generator (Admin)
  generateMonthlyInvoices: async (payload: IGenerateMonthlyInvoicesPayload) => {
    const response = await axiosInstance.post("/payments/generate-monthly-invoices", payload);
    return response.data;
  },

  // 3. Create Manual Single Invoice (Admin)
  createInvoice: async (payload: ICreateInvoicePayload) => {
    const response = await axiosInstance.post("/payments/create-invoice", payload);
    return response.data;
  },

  // 4. Collect / Submit Payment (Student/Parent/Admin)
  collectPayment: async (payload: ICollectPaymentPayload) => {
    const response = await axiosInstance.post("/payments/collect", payload);
    return response.data;
  },

  // 5. Approve or Reject Payment (Admin)
  approvePayment: async (payload: IApprovePaymentPayload) => {
    const response = await axiosInstance.patch("/payments/approve-payment", payload);
    return response.data;
  },

  // 6. Get Pending Approvals List (Admin)
  getPendingApprovals: async () => {
    const response = await axiosInstance.get("/payments/pending-approvals");
    return response.data;
  },

  // 7. Get Overdue Defaulter Tracker (Admin)
  getOverdueDefaulters: async () => {
    const response = await axiosInstance.get("/payments/overdue-defaulters");
    return response.data;
  },

  // 8. Get Invoices for Specific Student
  getStudentInvoices: async (studentId: string) => {
    const response = await axiosInstance.get(`/payments/student/${studentId}`);
    return response.data;
  },

  // 9. Get All Invoices (Admin)
  getAllInvoices: async () => {
    const response = await axiosInstance.get("/payments");
    return response.data;
  },
};