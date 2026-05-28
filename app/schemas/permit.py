from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class PermitBase(BaseModel):
    issue_on: datetime
    
    # Static Default Fields
    transit_id: str = Field("TRANSIT202605152858")
    tp_id: str = Field("2611260047")
    lessee_name: str = Field("Dasam Venkata Nagaraju")
    mineral_name: str = Field("Ordinary Earth")
    survey_number: str = Field("416 & 417")
    hsn_code: str = Field("25309099")
    
    authorized_qty: float = Field(300.0)
    actual_dispatch_quantity: float = Field(10.0)
    sale_value: float = Field(1000.0)
    
    validity_from: datetime
    validity_to: datetime
    
    consignee_name: str = Field("MAHESH", max_length=200)
    consignee_address: str = Field("CHENNAI", max_length=500)
    mandal: str = Field("Nagalapuram", max_length=100)
    village: str = Field("Kadivedu", max_length=100)
    district: str = Field("Tirupati", max_length=100)
    mobile_number: str = Field(..., max_length=20)
    gstin: Optional[str] = Field(None, max_length=50, description="VAT or GSTIN")
    stationary_number: str = Field(..., max_length=100)
    is_mdl: str = Field("Non-MDL", max_length=10) # MDL or Non-MDL
    
    vehicle_type: str = Field("Tipper Lorry", max_length=50)
    vehicle_number: str = Field(..., max_length=50)
    driver_name: str = Field(..., max_length=200)
    driving_license_number: str = Field(..., max_length=100)
    destination: str = Field("TIRUVALLUR", max_length=200)
    distance_km: float = Field(50.0)
    time_required: str = Field("004:30", max_length=20) # format HHH:MM

class PermitCreate(PermitBase):
    permit_number: str

class PermitUpdate(BaseModel):
    authorized_qty: Optional[float] = None
    validity_from: Optional[datetime] = None
    validity_to: Optional[datetime] = None
    consignee_name: Optional[str] = None
    consignee_address: Optional[str] = None
    mandal: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    mobile_number: Optional[str] = None
    sale_value: Optional[float] = None
    gstin: Optional[str] = None
    actual_dispatch_quantity: Optional[float] = None
    stationary_number: Optional[str] = None
    is_mdl: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None
    driving_license_number: Optional[str] = None
    destination: Optional[str] = None
    distance_km: Optional[float] = None
    time_required: Optional[str] = None
    status: Optional[str] = None # VALID, EXPIRED, CANCELLED

class PermitResponse(PermitBase):
    id: str
    permit_number: str
    qr_url: Optional[str] = None
    pdf_url: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
