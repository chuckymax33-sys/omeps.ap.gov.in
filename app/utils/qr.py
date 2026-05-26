import io
import base64
import qrcode

def generate_qr_code(url: str, permit_id: str = None) -> str:
    """
    Generates a QR code for a given URL and returns a base64 encoded data URI.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    # Generate image
    img = qr.make_image(fill_color="#0f172a", back_color="white") # Dark Navy fill for custom theme look

    # Save to memory buffer to get base64
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return f"data:image/png;base64,{img_base64}"
