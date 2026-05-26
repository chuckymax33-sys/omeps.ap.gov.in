export interface Permit {
  id: string;
  transit_id: string;
  tp_id: string;
  issue_on: string;
  lessee_name: string;
  mineral_name: string;
  survey_number: string;
  hsn_code: string;
  permit_number: string;
  authorized_qty: number;
  validity_from: string;
  validity_to: string;
  consignee_name: string;
  consignee_address: string;
  mandal: string;
  village: string;
  district: string;
  mobile_number: string;
  sale_value: number;
  gstin?: string | null;
  actual_dispatch_quantity: number;
  stationary_number: string;
  is_mdl: string;
  vehicle_type: string;
  vehicle_number: string;
  driver_name: string;
  driving_license_number: string;
  destination: string;
  distance_km: number;
  time_required: string;
  qr_url?: string;
  pdf_url?: string | null;
  status: "VALID" | "EXPIRED" | "CANCELLED";
  created_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  created_at: string;
}

export interface PermitCreateInput {
  issue_on: string;
  authorized_qty: number;
  validity_from: string;
  validity_to: string;
  consignee_name: string;
  consignee_address: string;
  mandal: string;
  village: string;
  district: string;
  mobile_number: string;
  sale_value: number;
  gstin?: string;
  actual_dispatch_quantity: number;
  stationary_number: string;
  is_mdl: string;
  vehicle_type: string;
  vehicle_number: string;
  driver_name: string;
  driving_license_number: string;
  destination: string;
  distance_km: number;
  time_required: string;
}
