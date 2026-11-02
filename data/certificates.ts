export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date?: string;
  credentialId?: string;
  category?: string;
  description?: string;
  skills?: string[];
  iconColor?: string;
  image?: string;
  boxBgColor?: string;
  createdAt?: number;
  updatedAt?: number;
}

export const certificatesData: Certificate[] = [];


