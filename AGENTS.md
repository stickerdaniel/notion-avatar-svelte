# AGENTS.md

## Pull requests

- End every PR body with `Generated with <model> for <job> in <tool> via <host>.` CI requires that line, including the period. For example, `Generated with Claude Opus 5.5 for implementation in Claude Code via T3 Code.` For several models, write `Generated with <model 1> for <job 1> and <model 2> for <job 2> in <tool> via <host>.` Every model needs a job. Commas or `/` list several jobs for one model.
