# Component and Data Patterns

Examples are short pseudocode. Translate them to the project's framework.

## Composition over configuration

```text
Good:  Card( CardHeader( CardTitle("Tasks") ), CardBody( TaskList(tasks) ) )
Avoid: Card(title="Tasks", headerVariant="large", bodyPadding="md", content=TaskList(tasks))
```

## Container vs presentational component

A container fetches and decides which state to show. A presentational component just renders what it's given.

```text
TaskListContainer:
    query = tasks query (generated API client, via the cache library)
    if query.loading:         render TaskListSkeleton
    if query.error:           render ErrorState("Couldn't load tasks", retry = query.refetch)
    if query.data is empty:   render EmptyState("No tasks yet", action = "Create task")
    render TaskList(query.data)
```

## Optimistic update with rollback

```text
on toggle(task):
    previous = cache.get("tasks")
    cache.set("tasks", task flipped)          # instant feedback
    try:    api.updateTask(task.id, { done: !task.done })
    except: cache.set("tasks", previous); show inline error
    finally: cache.invalidate("tasks")         # resync with the server
```

## Tokens vs invented values

```css
/* Good: tokens exported from the design system (names depend on the export) */
.panel { padding: var(--spacing-4); border-radius: var(--radius-md); color: var(--color-text); }
/* Bad: invented values */
.panel { padding: 13px; border-radius: 14px; color: #6366f1; }
```
