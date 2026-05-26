import sqlite3
from sqlalchemy import create_engine, text

permit_id = "36342ad3-1eae-4439-95d8-9549c86d0498"

# Check local SQLite
print("--- Checking Local SQLite ---")
try:
    conn = sqlite3.connect("transit_permits.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, permit_number FROM permits WHERE id=?", (permit_id,))
    row = cursor.fetchone()
    if row:
        print(f"Found in local SQLite! ID: {row[0]}, Permit Number: {row[1]}")
    else:
        print("Not found in local SQLite.")
    conn.close()
except Exception as e:
    print("Error checking local SQLite:", str(e))

# Check Supabase
print("\n--- Checking Supabase ---")
supabase_url = "postgresql://postgres:Akhil%401893332@db.icsusadjimjatjyishov.supabase.co:5432/postgres"
try:
    engine = create_engine(supabase_url)
    with engine.connect() as conn:
        res = conn.execute(text("SELECT id, permit_number FROM permits WHERE id = :id"), {"id": permit_id})
        row = res.fetchone()
        if row:
            print(f"Found in Supabase! ID: {row[0]}, Permit Number: {row[1]}")
        else:
            print("Not found in Supabase.")
except Exception as e:
    print("Error checking Supabase:", str(e))

# Check total permits in Supabase
print("\n--- Checking Total Permits in Supabase ---")
try:
    engine = create_engine(supabase_url)
    with engine.connect() as conn:
        res = conn.execute(text("SELECT COUNT(*) FROM permits"))
        count = res.scalar()
        print("Total permits in Supabase permits table:", count)
        
        res_users = conn.execute(text("SELECT COUNT(*) FROM admin_users"))
        count_users = res_users.scalar()
        print("Total admin users in Supabase admin_users table:", count_users)
except Exception as e:
    print("Error checking total in Supabase:", str(e))
