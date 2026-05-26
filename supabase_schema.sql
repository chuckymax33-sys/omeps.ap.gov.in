-- Supabase PostgreSQL Schema for Transit Permit Portal Backend
-- This script contains all the tables and indexes required to run the application using Supabase.
-- You can copy-paste and execute this script directly in the Supabase SQL Editor.

-- Enable UUID extension if needed (optional since we are currently using 36-character string/UUID IDs generated in Python)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 0. Drop Existing Tables
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS permits CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. Table: admin_users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- -----------------------------------------------------------------------------
-- 2. Table: permits
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permits (
    -- Primary & Identity Fields
    id VARCHAR(36) PRIMARY KEY,
    transit_id VARCHAR(50) DEFAULT 'TRANSIT202605152858',
    tp_id VARCHAR(50) DEFAULT '2611260047',
    permit_number VARCHAR(50) NOT NULL,
    issue_on TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Lessee & Mineral Info
    lessee_name VARCHAR(200) DEFAULT 'Dasam Venkata Nagaraju',
    mineral_name VARCHAR(100) DEFAULT 'Ordinary Earth',
    survey_number VARCHAR(100) DEFAULT '416 & 417',
    hsn_code VARCHAR(50) DEFAULT '25309099',
    
    -- Quantities
    authorized_qty DOUBLE PRECISION DEFAULT 300.00,
    actual_dispatch_quantity DOUBLE PRECISION DEFAULT 10.00,
    
    -- Validity Duration
    validity_from TIMESTAMP WITH TIME ZONE NOT NULL,
    validity_to TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Consignee & Sale Details
    consignee_name VARCHAR(200) DEFAULT 'MAHESH',
    consignee_address VARCHAR(500) DEFAULT 'CHENNAI',
    mandal VARCHAR(100) DEFAULT 'Nagalapuram',
    village VARCHAR(100) DEFAULT 'Kadivedu',
    district VARCHAR(100) DEFAULT 'Tirupati',
    mobile_number VARCHAR(20) NOT NULL,
    sale_value DOUBLE PRECISION DEFAULT 1000.0,
    gstin VARCHAR(50),
    stationary_number VARCHAR(100) NOT NULL,
    is_mdl VARCHAR(10) NOT NULL DEFAULT 'Non-MDL',
    
    -- Vehicle & Transport Details
    vehicle_type VARCHAR(50) DEFAULT 'Tipper Lorry',
    vehicle_number VARCHAR(50) NOT NULL,
    driver_name VARCHAR(200) NOT NULL,
    driving_license_number VARCHAR(100) NOT NULL,
    destination VARCHAR(200) DEFAULT 'TIRUVALLUR',
    distance_km DOUBLE PRECISION DEFAULT 50.0,
    time_required VARCHAR(20) DEFAULT '004:30',
    
    -- QR Code Metadata & Permit Management
    qr_url VARCHAR(500),
    pdf_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'VALID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Index for faster permit lookup by permit number (vital for QR scanning / validation)
CREATE INDEX IF NOT EXISTS idx_permits_permit_number ON permits(permit_number);
