# Autonomous Development (loop-style work)

If running an autonomous loop (Ralph-style or this platform's /loop): define a measurable stop condition and a max-iteration cap before starting, run tests after each meaningful iteration, stop on repeated failure rather than retrying blindly, and never treat loop completion as proof of correctness -- the quality gate in `.claude/rules/testing.md` still applies at the end.
