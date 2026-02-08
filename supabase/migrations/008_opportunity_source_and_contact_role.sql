-- Source tracking and contact role system for opportunities
-- source: where the opportunity came from (aggie_collaborate, manual, department_website)
-- contact_role: who the contact is (professor, phd_student, postdoc, lab_manager, research_scientist)
-- contact_title: optional title (Dr., Mr., Ms., etc.)

ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'aggie_collaborate',
  ADD COLUMN IF NOT EXISTS contact_role TEXT DEFAULT 'professor',
  ADD COLUMN IF NOT EXISTS contact_title TEXT;

-- Backfill: tag all existing opportunities as Aggie Collaborate with default role
UPDATE public.opportunities
SET
  source = COALESCE(NULLIF(TRIM(source), ''), 'aggie_collaborate'),
  contact_role = COALESCE(NULLIF(TRIM(contact_role), ''), 'professor')
WHERE source IS NULL OR TRIM(COALESCE(source, '')) = ''
   OR contact_role IS NULL OR TRIM(COALESCE(contact_role, '')) = '';

-- Optional: constrain allowed values (comment out if you prefer app-level validation only)
-- ALTER TABLE public.opportunities
--   ADD CONSTRAINT opportunities_source_check
--   CHECK (source IN ('aggie_collaborate', 'manual', 'department_website'));
-- ALTER TABLE public.opportunities
--   ADD CONSTRAINT opportunities_contact_role_check
--   CHECK (contact_role IN ('professor', 'phd_student', 'postdoc', 'lab_manager', 'research_scientist'));

COMMENT ON COLUMN public.opportunities.source IS 'Origin: aggie_collaborate | manual | department_website';
COMMENT ON COLUMN public.opportunities.contact_role IS 'Contact type: professor | phd_student | postdoc | lab_manager | research_scientist';
COMMENT ON COLUMN public.opportunities.contact_title IS 'Optional title: Dr., Mr., Ms., etc.';
