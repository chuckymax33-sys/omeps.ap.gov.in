import sqlite3
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    # Connect to SQLite
    sqlite_conn = sqlite3.connect('transit_permits.db')
    sqlite_cursor = sqlite_conn.cursor()

    # Get admin_users data
    sqlite_cursor.execute("SELECT * FROM admin_users")
    admin_users_data = sqlite_cursor.fetchall()
    admin_users_columns = [desc[0] for desc in sqlite_cursor.description]

    # Get permits data
    sqlite_cursor.execute("SELECT * FROM permits")
    permits_data = sqlite_cursor.fetchall()
    permits_columns = [desc[0] for desc in sqlite_cursor.description]

    # Connect to Supabase
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in .env")
        return
        
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    engine = create_engine(db_url)
    
    with engine.connect() as pg_conn:
        # Migrate admin_users
        if admin_users_data:
            placeholders = ', '.join([':' + col for col in admin_users_columns])
            insert_query = text(f"INSERT INTO admin_users ({', '.join(admin_users_columns)}) VALUES ({placeholders}) ON CONFLICT DO NOTHING")
            for row in admin_users_data:
                params = dict(zip(admin_users_columns, row))
                pg_conn.execute(insert_query, params)
                
        # Migrate permits
        if permits_data:
            placeholders = ', '.join([':' + col for col in permits_columns])
            insert_query = text(f"INSERT INTO permits ({', '.join(permits_columns)}) VALUES ({placeholders}) ON CONFLICT DO NOTHING")
            for row in permits_data:
                params = dict(zip(permits_columns, row))
                pg_conn.execute(insert_query, params)
                
        pg_conn.commit()
        print(f"Successfully migrated {len(admin_users_data)} admin_users and {len(permits_data)} permits to Supabase.")

if __name__ == '__main__':
    migrate()
