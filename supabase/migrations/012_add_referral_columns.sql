ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

CREATE INDEX IF NOT EXISTS idx_tenants_referral_code ON tenants(referral_code);
