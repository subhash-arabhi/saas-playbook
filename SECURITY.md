# Security policy

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub: open the repository's **Security** tab and choose **Report a vulnerability**. Don't open a public issue, pull request or discussion for a security problem.

Include what's affected (the installer, a tool in `tools/`, a rule or skill that leads agents to unsafe code), how to reproduce it, and the impact you expect.

## What to expect

- An acknowledgement within 7 days.
- An assessment and a plan (fix, mitigation, or why it isn't a vulnerability) within 30 days.
- A fix in a new release, credited to you in `CHANGELOG.md` unless you'd rather not be named. We'll agree a disclosure date with you.

## Supported versions

Only the latest release gets security fixes. Install or update with a pinned release tag (`npx github:subhash-arabhi/saas-playbook#vX.Y.Z`), and check the tarball against the SHA-256 and provenance attestation on its GitHub Release.

## Scope

The playbook's own code (`install.sh`, `tools/`) and its guidance: a rule, workflow or skill that tells agents to do something unsafe counts as a vulnerability. Vendored skills are in scope as shipped here; problems in their upstream projects should also go to those projects (`licenses/README.md` lists them).
