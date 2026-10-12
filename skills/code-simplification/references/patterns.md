# Simplification patterns (any language)

Use the project's language idioms. The shape of the improvement is the same everywhere.

## Nested inline conditionals → named function with early returns

```text
UNCLEAR:
label = isNew ? "New" : isUpdated ? "Updated" : isArchived ? "Archived" : "Active"

CLEAR:
function status_label(item):
    if item.isNew:      return "New"
    if item.isUpdated:  return "Updated"
    if item.isArchived: return "Archived"
    return "Active"
```

## One expression doing several jobs → named result built step by step

```text
UNCLEAR:
counts = fold(items, {}, (acc, item) -> merge(acc, {item.id: (acc[item.id] or 0) + 1}))

CLEAR:
count_by_id = empty map
for item in items:
    count_by_id[item.id] = count_by_id.get(item.id, 0) + 1
```

## Nested conditionals → guard clauses

```text
Before:
    function process(data):
        if data exists:
            if data.is_valid():
                if data.has_permission():
                    return do_work(data)
                else: fail("No permission")
            else: fail("Invalid data")
        else: fail("No data")
After:
    function process(data):
        if data is missing:           fail("No data")
        if not data.is_valid():       fail("Invalid data")
        if not data.has_permission(): fail("No permission")
        return do_work(data)
```

## Redundant boolean return

```text
Before:
    if length(input) > 0 and length(input) < 100:
        return true
    return false
After:
    return length(input) > 0 and length(input) < 100
```

## Manual list building → filter/map/comprehension

```text
Before:
    active = empty list
    for user in users:
        if user.isActive: append(active, user)
After:
    active = filter(users, user -> user.isActive)
```

## Pass-through wrapper

```text
Before:
    function get_user(id): return user_service.find_by_id(id)    # adds nothing
After:
    call user_service.find_by_id(id) directly
    (keep the wrapper if it's the seam tests fake, or it names a real concept)
```

## Names and comments

| Signal | Fix |
|---|---|
| `data`, `result`, `temp`, `val` | Describe the content: `userProfile`, `validationErrors` |
| `usr`, `cfg`, `btn`, `evt` | Full words (keep universal ones: `id`, `url`, `api`) |
| `get` that also changes state | Rename to what it does |
| `# increment counter` above `count += 1` | Delete the comment |
| `# Retry because the provider is flaky under load` | Keep: it carries intent |
