# Data Retention Policy

Observability logs (`observability/`) are append-only in intent -- don't edit history, add a new entry. No personal/sensitive data in audit logs; reference an external system (issue #, ticket ID) instead of pasting sensitive content. Logs older than 1 year may be archived/compressed, never silently deleted while still referenced by an open project.
