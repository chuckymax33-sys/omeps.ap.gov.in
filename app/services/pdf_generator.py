import os
from io import BytesIO
import base64
from jinja2 import Environment, FileSystemLoader
from playwright.sync_api import sync_playwright
from datetime import datetime
from app.models.permit import Permit
from app.utils.qr import generate_qr_code

def generate_permit_pdf(permit: Permit) -> bytes:
    """
    Generates a PDF bytes object for the given Permit using Playwright and Jinja2.
    """
    # 1. Generate QR Code Base64 using the same exact method as the UI
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    verify_url = f"{frontend_url}/permit/{permit.stationary_number}/{permit.transit_id}"
    qr_data_uri = generate_qr_code(verify_url, permit.transit_id)
    qr_b64 = qr_data_uri.replace("data:image/png;base64,", "")
    
    # Read base64 logo if it exists to embed it directly
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))
    logo_path = os.path.join(project_root, "public", "ap-logo.png")
    
    logo_b64 = ""
    if os.path.exists(logo_path):
        with open(logo_path, "rb") as f:
            logo_b64 = base64.b64encode(f.read()).decode("utf-8")
    
    # 2. Prepare Context
    context = {
        "permit": permit,
        "qr_base64": qr_b64,
        "logo_base64": logo_b64,
        "today_str": datetime.now().strftime("%d-%m-%Y"),
        "issue_date_str": permit.issue_on.strftime("%d-%m-%Y") if permit.issue_on else "",
        "valid_from_str": permit.validity_from.strftime("%d-%m-%Y") if permit.validity_from else "",
        "valid_to_str": permit.validity_to.strftime("%d-%m-%Y") if permit.validity_to else "",
        # Formatting
        "authorized_qty": f"{permit.authorized_qty:.2f}" if permit.authorized_qty else "0.00",
        "dispatch_qty": f"{permit.actual_dispatch_quantity:.2f}" if permit.actual_dispatch_quantity else "0.00",
        "sale_price": f"{permit.sale_value}" if permit.sale_value else "0",
    }
    
    # 3. Setup Jinja2 Environment
    templates_dir = os.path.join(os.path.dirname(current_dir), "templates")
    env = Environment(loader=FileSystemLoader(templates_dir))
    template = env.get_template("permit_template.html")
    
    # 4. Render HTML
    html_content = template.render(context)
    
    # 5. Convert to PDF using Playwright
    os.environ["PLAYWRIGHT_BROWSERS_PATH"] = os.path.join(project_root, ".playwright")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_content(html_content, wait_until="networkidle")
        pdf_bytes = page.pdf(
            format="A4",
            print_background=True,
            # Reset margins since CSS handles it
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
        )
        browser.close()
    
    return pdf_bytes
