-- migrations/002_auth_rbac.sql
-- Auth credentials and RBAC seed data

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Credentials table for password auth
CREATE TABLE IF NOT EXISTS credentials (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL DEFAULT '',
  last_rotated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Note: Replace 'TENANT_ID' with your actual tenant UUID after creating the tenant

-- Seed default roles (run after creating tenant)
-- INSERT INTO roles (tenant_id, key, name, description) VALUES
--   ('TENANT_ID', 'admin', 'Admin', 'Full system access'),
--   ('TENANT_ID', 'ops_manager', 'Ops Manager', 'Operational management access'),
--   ('TENANT_ID', 'project_lead', 'Project Lead', 'Project management access'),
--   ('TENANT_ID', 'viewer', 'Viewer', 'Read-only access');

-- Seed permissions
INSERT INTO permissions (key, resource, action) VALUES
  ('task.read', 'task', 'read'),
  ('task.create', 'task', 'create'),
  ('task.update', 'task', 'update'),
  ('task.delete', 'task', 'delete'),
  ('task.admin', 'task', 'admin'),
  ('doc.read', 'doc', 'read'),
  ('doc.create', 'doc', 'create'),
  ('doc.update', 'doc', 'update'),
  ('doc.delete', 'doc', 'delete'),
  ('doc.admin', 'doc', 'admin'),
  ('file.read', 'file', 'read'),
  ('file.create', 'file', 'create'),
  ('file.update', 'file', 'update'),
  ('file.delete', 'file', 'delete'),
  ('file.admin', 'file', 'admin'),
  ('project.read', 'project', 'read'),
  ('project.create', 'project', 'create'),
  ('project.update', 'project', 'update'),
  ('project.delete', 'project', 'delete'),
  ('project.admin', 'project', 'admin'),
  ('app.read', 'app', 'read'),
  ('app.admin', 'app', 'admin')
ON CONFLICT (key) DO NOTHING;

-- Helper function to hash password with bcrypt
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 12));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to verify password
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
