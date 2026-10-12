# Honouring an idempotency key

Accepting an `Idempotency-Key` is the contract; honouring it is the implementation. A key accepted but handled carelessly is worse than none: the client now believes retrying is safe. Duplicates are correlated with failures: retries spike when a dependency is degraded, exactly when duplicates cost most.

## 1. Derive the key from the intent, not the attempt

Stable across retries of one intent, different across distinct intents. It comes from the client or the initiating event, never from the layer doing the retrying.

```text
new_random_uuid()                  ✗ new key per attempt: every retry is a new charge
user_id + ":" + amount             ✗ two legitimate $50 charges collapse into one
order_id + ":" + current_time()    ✗ a timestamp is a random UUID in disguise

request.header("Idempotency-Key")  ✓ client generates once, reuses on retry
"charge:v1:" + order_id            ✓ derived from an immutable identifier
```

## 2. Claim atomically

A check followed by an act (`SELECT` then `INSERT`) is a race. Let a unique constraint pick the winner. A store that can't enforce uniqueness in one operation can't back this.

```text
try:
    db.insert(key, state = "in_progress", request_hash = hash(body))
on unique_violation:
    return replay_or_reject(key)
result = charge_card(amount)
db.update(key, state = "succeeded", response = result)
```

## 3. Guard the payload

Same key with a different body is a client bug. Fail loudly; never serve the first response to a second request.

```text
if existing.request_hash != hash(request.body):
    return 422, { error: { code: "IDEMPOTENCY_KEY_REUSED",
                           message: "Idempotency key reused with a different payload" } }
```

## 4. Choose what an in-flight duplicate gets

| Strategy | Response | Use when |
|---|---|---|
| Reject | `409 Conflict` | Client can retry later; simplest and safest |
| Wait | Block for the result, bounded | Caller needs it synchronously |
| Return pending | `202` + status URL | Long-running effects |

Never let the second caller through because the first "seems stuck".

## 5. Treat "unknown" as a third outcome

A timeout says nothing about whether the effect applied. Record the intent before calling out, so a crash between call and response leaves evidence to resolve, not a silent retried charge.

## 6. Set retention from the longest retry path

Keys must outlive every path that can re-deliver the intent, including a dead-letter queue replayed days later and any provider dispute window. A 24-hour TTL behind a 7-day dead-letter queue is a duplicate waiting to happen.
