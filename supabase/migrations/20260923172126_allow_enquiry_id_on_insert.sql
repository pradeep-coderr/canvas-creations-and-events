-- Let the server supply the enquiry id at insert time.
--
-- Why: the enquiry pipeline must reference the stored enquiry (e.g. as the
-- idempotency key for its notification email), but public roles deliberately
-- have no SELECT privilege, so `INSERT ... RETURNING id` is not possible.
-- The server action generates a random UUID (crypto.randomUUID) and inserts
-- it as the primary key. The column default gen_random_uuid() still applies
-- to any insert that omits the id.
--
-- Unchanged: RLS, the single insert-only policy (status must be 'new'), and
-- the absence of any public SELECT/UPDATE/DELETE. Public roles still cannot
-- set status or timestamps.

grant insert (id) on table public.enquiries to anon, authenticated;
