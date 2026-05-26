# Backend-only Docker image for Render deployment.
# The React frontend is deployed separately on Vercel.
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required by Playwright's Chromium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright's Chromium browser and its OS-level dependencies
RUN playwright install chromium
RUN playwright install-deps chromium

# Copy backend application code
COPY app /app/app
COPY supabase_schema.sql /app/

# Copy public assets (AP logo used in PDF generation)
COPY public /app/public

# Create static directories for local PDF/QR fallback
RUN mkdir -p /app/static/pdfs /app/static/qrcodes

# Expose the port the app runs on
EXPOSE 8000

# Start the application using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
