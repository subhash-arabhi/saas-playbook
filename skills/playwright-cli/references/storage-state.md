# Storage Management

<!-- Vendored from microsoft/playwright-cli@b85c7a7 (Apache-2.0, see licenses/). Changes: auth state only for project test accounts, in gitignored files; removed reading auth cookies or tokens and the cookie-injection roundtrip; examples use non-auth values; added the command list from SKILL.md. -->

Manage cookies, localStorage, sessionStorage, and browser storage state.

**Rules:** save auth state only for sessions logged in with the project's **test accounts**, into a gitignored file (under `.playwright-cli/`). Never read auth cookies, tokens or session data, and never inject them into a session.

## Command list

```bash
playwright-cli state-save .playwright-cli/test-user.auth-state.json
playwright-cli state-load .playwright-cli/test-user.auth-state.json

# Cookies
playwright-cli cookie-list --domain=localhost
playwright-cli cookie-set theme dark
playwright-cli cookie-delete theme
playwright-cli cookie-clear

# LocalStorage
playwright-cli localstorage-list
playwright-cli localstorage-get theme
playwright-cli localstorage-set theme dark
playwright-cli localstorage-delete theme
playwright-cli localstorage-clear

# SessionStorage
playwright-cli sessionstorage-list
playwright-cli sessionstorage-get step
playwright-cli sessionstorage-set step 3
playwright-cli sessionstorage-delete step
playwright-cli sessionstorage-clear
```

## Storage State

Save and restore complete browser state including cookies and storage.

### Save Storage State

```bash
# Save to a gitignored file
playwright-cli state-save .playwright-cli/test-user.auth-state.json
```

### Restore Storage State

```bash
# Load storage state from file
playwright-cli state-load .playwright-cli/test-user.auth-state.json

# Reload page to apply cookies
playwright-cli open http://localhost:3000
```

### Storage State File Format

The saved file contains:

```json
{
  "cookies": [
    {
      "name": "theme",
      "value": "dark",
      "domain": "localhost",
      "path": "/",
      "expires": 1893456000,
      "httpOnly": false,
      "secure": false,
      "sameSite": "Lax"
    }
  ],
  "origins": [
    {
      "origin": "http://localhost:3000",
      "localStorage": [
        { "name": "theme", "value": "dark" }
      ]
    }
  ]
}
```

For a logged-in session the file also holds the session cookie, so treat it like a password: gitignored, deleted when done.

## Cookies

### List Cookies

```bash
playwright-cli cookie-list
playwright-cli cookie-list --domain=localhost
playwright-cli cookie-list --path=/api
```

`cookie-list` prints values too, so use it only in test-account sessions, to check which cookies exist and their flags (`HttpOnly`, `Secure`, `SameSite`). Never copy a session value out of it.

### Set a Cookie

```bash
# Basic cookie
playwright-cli cookie-set theme dark

# Cookie with options
playwright-cli cookie-set theme dark --domain=localhost --path=/ --sameSite=Lax

# Cookie with expiration (Unix timestamp)
playwright-cli cookie-set consent accepted --expires=1893456000
```

### Delete a Cookie

```bash
playwright-cli cookie-delete theme
```

### Clear All Cookies

```bash
playwright-cli cookie-clear
```

### Advanced: Multiple Cookies or Custom Options

For complex scenarios like adding multiple cookies at once, use `run-code`:

```bash
playwright-cli run-code "async page => {
  await page.context().addCookies([
    { name: 'consent', value: 'accepted', domain: 'localhost', path: '/' },
    { name: 'preferences', value: JSON.stringify({ theme: 'dark' }), domain: 'localhost', path: '/' }
  ]);
}"
```

## Local Storage

### List All localStorage Items

```bash
playwright-cli localstorage-list
```

### Get Single Value

```bash
playwright-cli localstorage-get theme
```

### Set Value

```bash
playwright-cli localstorage-set theme dark
```

### Set JSON Value

```bash
playwright-cli localstorage-set user_settings '{"theme":"dark","language":"en"}'
```

### Delete Single Item

```bash
playwright-cli localstorage-delete theme
```

### Clear All localStorage

```bash
playwright-cli localstorage-clear
```

### Advanced: Multiple Operations

For complex scenarios like setting multiple values at once, use `run-code`:

```bash
playwright-cli run-code "async page => {
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('language', 'en');
    localStorage.setItem('onboarding_done', 'true');
  });
}"
```

## Session Storage

### List All sessionStorage Items

```bash
playwright-cli sessionstorage-list
```

### Get Single Value

```bash
playwright-cli sessionstorage-get form_data
```

### Set Value

```bash
playwright-cli sessionstorage-set step 3
```

### Delete Single Item

```bash
playwright-cli sessionstorage-delete step
```

### Clear sessionStorage

```bash
playwright-cli sessionstorage-clear
```

## IndexedDB

### List Databases

```bash
playwright-cli run-code "async page => {
  return await page.evaluate(async () => {
    const databases = await indexedDB.databases();
    return databases;
  });
}"
```

### Delete Database

```bash
playwright-cli run-code "async page => {
  await page.evaluate(() => {
    indexedDB.deleteDatabase('myDatabase');
  });
}"
```

## Common Patterns

### Authentication State Reuse (project test accounts only)

```bash
# Step 1: Log in with a project test account and save state
playwright-cli open http://localhost:3000/login
playwright-cli snapshot
playwright-cli fill e1 "$TEST_USER_EMAIL"
playwright-cli fill e2 "$TEST_USER_PASSWORD"
playwright-cli click e3

# Save the authenticated state to a gitignored file
playwright-cli state-save .playwright-cli/test-user.auth-state.json

# Step 2: Later, restore state and skip login
playwright-cli state-load .playwright-cli/test-user.auth-state.json
playwright-cli open http://localhost:3000/dashboard
# Already logged in!
```

Test account credentials come from `.env.local` (or the test setup), never from a real user.

## Security Notes

- Only project test accounts, never a real user's or your own account
- Keep state files under `.playwright-cli/` (gitignored); never commit them
- Delete state files after automation completes
- Use environment variables for test credentials
- By default, sessions run in-memory mode which is safer for sensitive operations
