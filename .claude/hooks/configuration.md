# Hook Configuration Notes

Current account has: GateGuard (fact-forcing gate on first Bash command and first-touch Write/Edit per session; destructive-action checks always on), caveman mode hooks (session-start banner + style enforcement), ponytail mode hooks (session-start banner).

These are personal preferences, not engineering-system requirements -- do not assume a fresh machine has them, and do not depend on their exact behavior in automation. If a bootstrap script needs a hook-free environment to run (e.g. CI), it should not rely on interactive-session hooks existing at all.
