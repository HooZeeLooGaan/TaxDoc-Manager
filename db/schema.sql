-- 1. Create Custom ENUM Types
CREATE TYPE requirement_source AS ENUM ('SYSTEM_DERIVED', 'MANUAL');
CREATE TYPE requirement_status AS ENUM ('PENDING', 'FULFILLED', 'WAIVED');
CREATE TYPE flag_reason AS ENUM ('LOW_CONFIDENCE', 'WRONG_YEAR', 'UNREADABLE', 'UNMATCHED');

-- 2. Create Clients Table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_name VARCHAR(100) NOT NULL,
    spouse_name VARCHAR(100),
    tax_year INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Requirements Table
CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    status requirement_status NOT NULL DEFAULT 'PENDING',
    source requirement_source NOT NULL DEFAULT 'SYSTEM_DERIVED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Create Ingested Documents Table
CREATE TABLE ingested_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    assigned_requirement_id UUID REFERENCES requirements(id) ON DELETE SET NULL,
    
    -- Google Drive & File Identification
    google_drive_file_id VARCHAR(255) NOT NULL UNIQUE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    
    -- AI Classification Results
    -- ai_predicted_type VARCHAR(50),
    -- ai_predicted_year INT,
    -- ai_predicted_owner VARCHAR(100),
    -- ai_confidence_score NUMERIC(3, 2), 
    
    -- -- Verification & Exception Handling
    -- status document_status DEFAULT 'PENDING_CLASSIFICATION',
    -- needs_attention BOOLEAN DEFAULT FALSE,
    -- flag_reason flag_reason,
    -- review_notes TEXT,
    
    -- Audit Timestamps & Tracking
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- SEED DATA: Rivera Household (Tax Year 2025)
-- -----------------------------------------------------------------------------

-- Seed Client
-- INSERT INTO clients (id, primary_name, spouse_name, tax_year) 
-- VALUES ('c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c', 'Ana Rivera', 'Luis Rivera', 2025);

-- -- Seed Baseline Requirements
-- -- Universal: Prior Year 1040 & Govt IDs
-- INSERT INTO requirements (client_id, document_type, owner_name, source, status) VALUES
-- ('c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c', 'FORM_1040', 'Ana & Luis Rivera', 'SYSTEM', 'PENDING'),
-- ('c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c', 'GOVT_ID', 'Ana Rivera', 'SYSTEM', 'PENDING'),
-- ('c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c', 'GOVT_ID', 'Luis Rivera', 'SYSTEM', 'PENDING');

-- -- Baseline W-2s: Ana (2 jobs), Luis (1 initial job)
-- INSERT INTO requirements (client_id, document_type, owner_name, employer_name, source, status) VALUES
-- ('c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c', 'W2', 'Ana Rivera', 'Company A (Job 1)', 'SYSTEM', 'PENDING'),
-- ('c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c', 'W2', 'Ana Rivera', 'Company B (Job 2)', 'SYSTEM', 'PENDING'),
-- ('c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c', 'W2', 'Luis Rivera', 'Company C (Job 1)', 'SYSTEM', 'PENDING');