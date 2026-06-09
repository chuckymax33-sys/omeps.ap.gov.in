import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from app.database.connection import Base

from datetime import timezone, timedelta

def get_ist_now():
    IST = timezone(timedelta(hours=5, minutes=30))
    return datetime.now(IST).replace(tzinfo=None)

class Permit(Base):
    __tablename__ = "permits"

    # UUID primary key
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    transit_id = Column(String(50), default="TRANSIT202605152858")
    tp_id = Column(String(50), default="2611260047")
    permit_number = Column(String(50), index=True, default="TPPER202605152316")
    issue_on = Column(DateTime, nullable=False)
    
    lessee_name = Column(String(200), default="Dasam Venkata Nagaraju")
    mineral_name = Column(String(100), default="Ordinary Earth")
    survey_number = Column(String(100), default="416 & 417")
    hsn_code = Column(String(50), default="25309099")

    authorized_qty = Column(Float, default=300.00)
    actual_dispatch_quantity = Column(Float, default=10.00)
    
    validity_from = Column(DateTime, nullable=False)
    validity_to = Column(DateTime, nullable=False)
    
    # Consignee details
    consignee_name = Column(String(200), default="MAHESH")
    consignee_address = Column(String(500), default="CHENNAI")
    mandal = Column(String(100), default="Nagalapuram")
    village = Column(String(100), default="Kadivedu")
    district = Column(String(100), default="Tirupati")
    mobile_number = Column(String(20), nullable=False)
    sale_value = Column(Float, default=1000.0)
    gstin = Column(String(50), nullable=True) # VAT/GSTIN
    stationary_number = Column(String(100), nullable=False)
    is_mdl = Column(String(10), nullable=False, default="Non-MDL")
    
    # Vehicle and Transport Details
    vehicle_type = Column(String(50), default="Tipper Lorry")
    vehicle_number = Column(String(50), nullable=False)
    driver_name = Column(String(200), nullable=False)
    driving_license_number = Column(String(100), nullable=False)
    destination = Column(String(200), default="TIRUVALLUR")
    distance_km = Column(Float, default=50.0)
    time_required = Column(String(20), default="004:30")
    
    # QR Code metadata
    qr_url = Column(String(500), nullable=True)
    pdf_url = Column(String(500), nullable=True)
    
    # Management fields
    status = Column(String(20), default="VALID")
    created_at = Column(DateTime, default=get_ist_now)
