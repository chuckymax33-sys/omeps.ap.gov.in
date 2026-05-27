import os
import random
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.permit import Permit
from app.models.user import AdminUser
from app.schemas.permit import PermitCreate, PermitUpdate, PermitResponse
from app.auth.jwt import get_current_admin
from app.utils.qr import generate_qr_code

router = APIRouter(prefix="/api/permits", tags=["Permits"])

def generate_permit_number() -> str:
    """
    Generates a unique permit number in the format PRYYMMDDHHMMSSXX
    e.g. PR26052512304589
    """
    now = datetime.now()
    date_str = now.strftime("%y%m%d%H%M%S")
    rand_digits = "".join(str(random.randint(0, 9)) for _ in range(2))
    return f"PR{date_str}{rand_digits}"

def check_and_update_permit_status(permit: Permit) -> str:
    """
    Determines validity dynamically based on time and returns current status.
    """
    if permit.status == "CANCELLED":
        return "CANCELLED"
    
    # Compare with current UTC time
    now_utc = datetime.now(timezone.utc)
    
    # If permit.validity_to is naive (e.g. SQLite), make now_utc naive
    if permit.validity_to.tzinfo is None:
        now_utc = datetime.utcnow()
        
    if now_utc > permit.validity_to:
        return "EXPIRED"
        
    return "VALID"

@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_permit(
    permit_in: PermitCreate,
    db: Session = Depends(get_db)
):
    """
    Public Endpoint: Create a transit permit.
    Generates unique ID, unique permit number, and custom QR code.
    Returns the created permit along with its Base64 QR code.
    """
    # 1. Generate unique permit number
    permit_num = generate_permit_number()
    while db.query(Permit).filter(Permit.permit_number == permit_num).first() is not None:
        permit_num = generate_permit_number()
        
    # 2. Instantiate Permit model
    permit_data = permit_in.model_dump()
    
    # Generate random transit ID with last 4 digits randomized
    new_transit_id = f"TRANSIT20260515{random.randint(0, 9999):04d}"
    
    permit_data["transit_id"] = new_transit_id

    db_permit = Permit(
        permit_number=permit_num,
        status="VALID",
        **permit_data
    )
    
    # 3. Add to session to generate ID
    db.add(db_permit)
    db.commit()
    db.refresh(db_permit)
    
    # 4. Generate QR Code with secure URL: https://domain.com/permit/{permit_number}
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    verification_url = f"{frontend_url}/permit/{db_permit.permit_number}"
    
    qr_base64 = generate_qr_code(verification_url, db_permit.permit_number)
    
    # Extract base64 part and decode to bytes
    import base64
    from app.services.supabase_storage import upload_qr_to_supabase
    
    qr_b64_str = qr_base64.replace("data:image/png;base64,", "")
    qr_bytes = base64.b64decode(qr_b64_str)
    
    # Upload QR to Supabase
    qr_filename = f"qr_{db_permit.permit_number}.png"
    qr_public_url = upload_qr_to_supabase(qr_bytes, qr_filename)
    
    # Save the QR URL to database
    db_permit.qr_url = qr_public_url
    db.commit()
    
    # 5. Return detailed response
    return {
        "permit": db_permit,
        "permit_id": db_permit.id,
        "permit_number": db_permit.permit_number,
        "qr_code": qr_base64,
        "permit_url": verification_url
    }

@router.get("/{permit_id}")
def get_permit_by_id(
    permit_id: str,
    db: Session = Depends(get_db)
):
    """
    Public Endpoint: Get a permit by UUID, permit_number, or transit_id for verification.
    """
    permit = db.query(Permit).filter(
        or_(
            Permit.id == permit_id,
            Permit.permit_number == permit_id,
            Permit.transit_id == permit_id
        )
    ).first()
    if not permit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid permit ID."
        )
        
    # Calculate status dynamically
    current_status = check_and_update_permit_status(permit)
    if current_status != permit.status:
        permit.status = current_status
        db.commit()
        db.refresh(permit)
        
    # Generate QR Code image base64 dynamically so it's guaranteed to load on verification page
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    verification_url = f"{frontend_url}/permit/{permit.permit_number}"
    qr_base64 = generate_qr_code(verification_url, permit.permit_number)
    
    return {
        "permit": permit,
        "status": current_status,
        "qr_code": qr_base64,
        "permit_url": verification_url
    }

from fastapi.responses import Response
from app.services.pdf_generator import generate_permit_pdf
from app.services.supabase_storage import upload_pdf_to_supabase

@router.get("/{permit_id}/pdf")
def get_permit_pdf(
    permit_id: str,
    db: Session = Depends(get_db)
):
    """
    Public Endpoint: Generates a PDF for the permit and returns it.
    Also uploads the generated PDF to Supabase Storage.
    """
    permit = db.query(Permit).filter(
        or_(
            Permit.id == permit_id,
            Permit.permit_number == permit_id,
            Permit.transit_id == permit_id
        )
    ).first()
    if not permit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid permit ID."
        )
        
    # Generate PDF
    pdf_bytes = generate_permit_pdf(permit)
    
    # Return PDF directly to browser so it can be viewed/printed
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"'
        }
    )

@router.get("", response_model=List[PermitResponse])
def get_permits(
    search: Optional[str] = Query(None, description="Search by permit number, vehicle, driver, or consignee"),
    status_filter: Optional[str] = Query(None, description="Filter by status (VALID, EXPIRED, CANCELLED)"),
    destination_filter: Optional[str] = Query(None, description="Filter by destination"),
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Protected Admin Endpoint: Query permits with search and filter parameters.
    """
    query = db.query(Permit)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Permit.permit_number.ilike(search_term),
                Permit.consignee_name.ilike(search_term),
                Permit.vehicle_number.ilike(search_term),
                Permit.driver_name.ilike(search_term)
            )
        )
        
    # Apply status filter
    if status_filter:
        query = query.filter(Permit.status == status_filter)
        
    # Apply destination filter
    if destination_filter:
        query = query.filter(Permit.destination.ilike(f"%{destination_filter}%"))
        
    permits = query.order_by(Permit.created_at.desc()).all()
    
    # Dynamically update status checks
    for p in permits:
        current_status = check_and_update_permit_status(p)
        if current_status != p.status:
            p.status = current_status
            db.add(p)
    db.commit()
    
    return permits

@router.put("/{permit_id}", response_model=PermitResponse)
def update_permit(
    permit_id: str,
    permit_update: PermitUpdate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Protected Admin Endpoint: Edit permit properties or manually cancel/expire it.
    """
    db_permit = db.query(Permit).filter(Permit.id == permit_id).first()
    if not db_permit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permit not found"
        )
        
    update_data = permit_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_permit, key, value)
        
    db.commit()
    db.refresh(db_permit)
    return db_permit

@router.delete("/{permit_id}", status_code=status.HTTP_200_OK)
def delete_permit(
    permit_id: str,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Protected Admin Endpoint: Delete a permit record.
    """
    db_permit = db.query(Permit).filter(Permit.id == permit_id).first()
    if not db_permit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permit not found"
        )
        
    db.delete(db_permit)
    db.commit()
    return {"detail": "Permit successfully deleted"}
