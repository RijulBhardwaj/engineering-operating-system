# Error / Failure Log

Failures and their resolution -- not a bug tracker (GitHub Issues covers that), this is for "what broke during engineering-system operation itself and how it got fixed." Example: heredoc batching failure during this bootstrap (large multi-file heredoc batch threw a bash parse error; isolated by splitting into smaller heredoc batches -- root cause not fully isolated, noted as a known rough edge rather than guessed at).
