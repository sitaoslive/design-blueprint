# Selected security fixes — 2026-11-21

Scope: exactly the nine findings selected by the user. No other finding was fixed, ignored, or dismissed.

## Applied protections
- `has_role` and `has_any_role` now use SECURITY INVOKER and the existing protected `user_roles` reads. `is_ops` and `is_staff` also use SECURITY INVOKER. Unprivileged callers can query only their own role records; directors retain authorized account management. Nested calls within already-authorized privileged commands retain their existing execution permissions.
- `is_director` retains SECURITY DEFINER to avoid recursive role-table policies, but explicitly permits only the caller’s own identity, authorized directors, or the verified service role. It reads the role table directly rather than recursively calling the invoker helpers.
- Existing helper grants exclude PUBLIC and anonymous users. Function names, parameters, return types and policy interfaces are unchanged.
- `feature_flags` is restricted to staff and technical support. `staff_members` permits staff, the linked account, and families with a related appointment. `specialists` permits staff, the linked specialist, and families with a relevant referral. Existing writes are unchanged.
- `can_read_field_file` requires current primary assignment or active participation for visit evidence. The original uploader cannot bypass this. Task evidence also requires current task assignment and, when applicable, current assignment to that task’s visit. Standalone uploader/recipient/broadcast access and operations oversight remain available.
- The existing metadata and storage read policies already call `can_read_field_file`, so both inherit the correction without modifying managed storage schema. Previously issued signed URLs remain valid until expiry; new reads and signed-link creation are denied once assignment is withdrawn.

Applied through the migration tool: `drizzle/migrations/0039_selected_security_role_directory_evidence_scope.sql`. Live function definitions, invoker/definer flags, grants and policy predicates were read back after application. No UI, booking, financial, publication or external-provider behavior was added.

## Verified tests
Actual authenticated Data API requests, using one isolated temporary account and authoritative role changes rather than client-side role labels:

| Phase | Assertions | Result |
|---|---:|---|
| Customer | 17 | Own role readable; five selected helpers cannot reveal the known director’s roles; unrelated settings/staff/specialists hidden; hydration queries remain usable |
| Director | 17 | Authorized cross-account checks, directories and operational settings remain usable; no role-policy recursion |
| Assigned auxiliary | 9 | Synthetic visit metadata and read authorization allowed; standalone uploader access retained |
| Auxiliary after assignment removal | 9 | Original uploader denied visit-file authorization and metadata; standalone file remains accessible |
| Veterinarian after assignment removal | 9 | Original uploader still denied visit evidence despite general clinical visit visibility |
| Existing automated regressions | 67 | Four suites passed: permissions/preparation, protected quality, field operations, referrals |

Total live assertions: **61 passed**. Reproduction scripts and Boolean-only evidence are in `scripts/security-selected/` and `evidence/security-selected/`. Session credentials are read locally, never stored in this repository or printed. Scripts require a newly authorized temporary account and the described phase-specific roles; they are not unattended production fixtures.

Final full regression suite: **505 tests passed in 34 files**; saved output is `evidence/security-selected/full-vitest.log`. Existing route metadata was inspected; no page or route files were changed.

Basic security recheck found no issues in its completed checks; this is not a new deep-code or penetration-test certification. No unrelated findings were managed. All nine selected findings are marked fixed after live verification.

## Test data and boundaries
Only isolated synthetic pet/staff/visit/file-metadata rows were created. No file objects were uploaded, no clinical care or payment was recorded, and no external messages or confirmations were sent. Those rows and their queued synthetic events were removed; cleanup readback returned **zero remaining synthetic rows**. Audit history was retained. All demo profiles/accounts and Luis’s account remain untouched. The temporary test account is removed by the auth-session lifecycle.

The administrative read-query tool could not assume the authenticated role, so access tests used actual authenticated HTTP requests instead; privileged read-query output alone was not counted as authorization proof.