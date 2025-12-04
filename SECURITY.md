# Security Controls

- **Rotation policy:** secrets_vault entries rotate every 30 days (critical adapters every 14 days); failed rotations retried 3x with exponential backoff.
- **RBAC roles:** viewer (read-only), operator (run workflows), admin (configure adapters and secrets), auditor (export logs). Scoped per workspace.
- **Audit retention:** rotation/access logs retained 400 days; workflow/run logs retained 180 days with signed checksums.
- **Compliance roadmap:** SOC 2 Type II evidence in progress; ISO 27001 mapping drafted; DPAs and subprocessor list available.
