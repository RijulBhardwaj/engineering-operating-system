# Engineering Principles

Security by default. Least privilege. Fail-safe defaults. Reproducible builds. Explicit dependencies. Modular, separated concerns. Observable. Maintainable. Testable. Docs as part of dev, not after. IaC where it earns its keep. Automate before repeating manual work by hand a third time. Verify before claiming done. No silent failures. No untracked config changes. No undocumented architectural decisions.

## Anti-patterns to actively resist

- Building for hypothetical future scale/requirements not in the current spec.
- Choosing a technology because it is familiar rather than because it fits.
- Microservices/Kubernetes/distributed-anything by default -- justify the complexity against the actual requirement, every time (see architecture.md).
- Reporting a skipped test as a passed test.
- Treating a successful build as "production ready."
