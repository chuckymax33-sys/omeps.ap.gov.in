import urllib.parse
from sqlalchemy import create_engine

# Attempt 1: Raw connection string from .env
db_url_raw = "postgresql://postgres:[Akhil@1893332]@db.icsusadjimjatjyishov.supabase.co:5432/postgres"
print("Attempt 1: raw URL:", db_url_raw)
try:
    engine = create_engine(db_url_raw)
    engine.connect()
    print("Attempt 1 succeeded!")
except Exception as e:
    print("Attempt 1 failed:", str(e))

# Attempt 2: Without brackets, but with raw @
db_url_no_brackets = "postgresql://postgres:Akhil@1893332@db.icsusadjimjatjyishov.supabase.co:5432/postgres"
print("\nAttempt 2: no brackets, raw @:", db_url_no_brackets)
try:
    engine = create_engine(db_url_no_brackets)
    engine.connect()
    print("Attempt 2 succeeded!")
except Exception as e:
    print("Attempt 2 failed:", str(e))

# Attempt 3: Without brackets, URL encoded @
password_encoded = urllib.parse.quote_plus("Akhil@1893332")
db_url_encoded = f"postgresql://postgres:{password_encoded}@db.icsusadjimjatjyishov.supabase.co:5432/postgres"
print("\nAttempt 3: encoded @:", db_url_encoded)
try:
    engine = create_engine(db_url_encoded)
    engine.connect()
    print("Attempt 3 succeeded!")
except Exception as e:
    print("Attempt 3 failed:", str(e))
