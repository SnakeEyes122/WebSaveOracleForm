-- ==============================================================================
-- Oracle Forms Repository Management System - Database Schema
-- For Supabase PostgreSQL
-- ==============================================================================

-- 1. Create Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Insert Initial Roles
INSERT INTO roles (name) VALUES ('Admin'), ('Developer'), ('Viewer');

-- 2. Create Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    full_name VARCHAR(150),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Modules Table
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, name)
);

-- 5. Create Files Table (Master File Metadata)
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
    system_name VARCHAR(150), -- e.g., HR, Finance
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL, -- usually same as original_name
    extension VARCHAR(10) NOT NULL,  -- .fmb, .fmx, .rdf
    latest_version VARCHAR(20) DEFAULT '1.0',
    status VARCHAR(50) DEFAULT 'Active', -- Active, Archived
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (module_id, file_name) -- A module can only have one file with a specific name, versions handle updates
);

-- 6. Create File Versions Table (Stores physical file mapping)
CREATE TABLE file_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    version_number VARCHAR(20) NOT NULL,
    storage_path TEXT NOT NULL, -- Path in Supabase bucket
    bucket_name VARCHAR(100) NOT NULL DEFAULT 'oracle-forms-repo',
    file_size BIGINT NOT NULL,
    checksum_sha256 VARCHAR(255),
    upload_by UUID REFERENCES users(id) ON DELETE SET NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    remark TEXT,
    UNIQUE (file_id, version_number)
);

-- 7. Create Download History Table
CREATE TABLE download_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_version_id UUID REFERENCES file_versions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    download_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

-- 8. Create Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- Upload, Delete, Download, Update Metadata, Login, Logout
    entity_type VARCHAR(50),     -- File, User, Project, Module
    entity_id UUID,              -- ID of the affected entity
    details JSONB,               -- Additional JSON info
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_files_module_id ON files(module_id);
CREATE INDEX idx_files_file_name ON files(file_name);
CREATE INDEX idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX idx_download_history_file_version ON download_history(file_version_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ==============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- DEFAULT ADMIN USER SEED
-- ==============================================================================
-- Password: password123 (hashed with bcrypt - cost 10)
INSERT INTO users (username, password_hash, role_id, full_name)
VALUES (
    'admin', 
    '$2b$10$GrRnV7eOTJ9hOEB8hYdj0ufUIyFvrHA.Pk3ziaPiPj2I90cyBfvXe', 
    (SELECT id FROM roles WHERE name = 'Admin'), 
    'System Administrator'
);
