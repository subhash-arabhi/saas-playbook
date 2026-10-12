# Review templates

## Written review

```markdown
## Review: [PR/Change title]

### Context
- [ ] I understand what this change does and why

### Correctness
- [ ] Matches spec/task requirements
- [ ] Edge cases and error paths handled
- [ ] Tests cover the change (regression test for a bug fix)

### Readability
- [ ] Clear, consistent names; straightforward logic
- [ ] No unnecessary complexity

### Architecture
- [ ] Follows existing patterns; appropriate abstraction level
- [ ] Refactors reduce complexity rather than relocate it
- [ ] No feature logic in shared modules; files stay a healthy size

### Security
- [ ] No secrets; input validated at boundaries; auth checks in place
- [ ] No injection; external data treated as untrusted

### Performance
- [ ] No N+1, no unbounded operations, list endpoints paginated

### Verification
- [ ] Tests pass, build succeeds, manual check done (if applicable)

### Findings
(Critical / Required / Optional / Nit / FYI, most important first)

### Verdict
- [ ] **Approve**
- [ ] **Request changes**: Critical must be fixed; Required fixed or explicitly accepted by the user
```

## Multi-model review

Different models have different blind spots. Model A writes, model B reviews for correctness and architecture, model A addresses feedback, the human makes the final call.

Prompt for the reviewing agent:

```text
Review this code change for correctness, security, and adherence to
our project conventions. The spec says [X]. The change should [Y].
Flag any issues as Critical, Required, Optional, or Nit.
```

## Dead code report

```text
DEAD CODE IDENTIFIED:
- format_legacy_date() in utils/date: replaced by format_date()
- OldTaskCard UI component: replaced by TaskCard
- LEGACY_API_URL in config: no remaining references
→ Safe to remove these?
```
