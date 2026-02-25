export interface EsimProvisioning {
  iccid: string;
  qrCode: string;
  activationLink: string;
  status: 'pending' | 'provisioning' | 'active' | 'failed';
  orderNumber: string;
  expiryDate?: string;
}

export interface OrderEsim {
  id: string;
  orderId: number;
  productName: string;
  sku: string;
  quantity: number;
  provisioning?: EsimProvisioning;
  createdAt: string;
}

export interface ProvisioningStatus {
  success: boolean;
  orderId: number;
  status: 'pending' | 'provisioned' | 'failed';
  data: {
    iccid?: string;
    order_number?: string;
    status?: string;
    provisioned_at?: string;
  };
}