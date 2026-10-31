# Orchestration

Reuses the platform's own Agent tool (single subagent) and Workflow tool (multi-stage pipeline, opt-in). See registry/agents.yaml for the model-tier/invoke-when policy and .claude/rules/agent-coordination.md for coordination rules (file ownership, parallel-vs-serial, independent review). No custom orchestration engine was built -- see harness/README.md for why.
