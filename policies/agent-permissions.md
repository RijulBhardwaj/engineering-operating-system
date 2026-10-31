# Agent Permissions Policy

Agents get the minimum tool scope the task needs. No agent gets blanket filesystem/network access by default. Destructive actions (delete, force-push, drop data) require explicit user confirmation regardless of which agent is acting -- this is the same boundary the assistant itself operates under, restated so it's not lost when delegating to a sub-agent or workflow.
