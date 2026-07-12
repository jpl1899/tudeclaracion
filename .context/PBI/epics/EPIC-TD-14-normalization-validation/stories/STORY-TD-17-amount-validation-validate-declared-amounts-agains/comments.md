# Comments for TD-17

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-17)

---

### Juan Leites - 7/7/2026, 20:04:41

Blocked — depends on DGI minimum-amount and amount-range rules for the 2181, not yet defined (see `07-validator.md` and `Tax-rules/2181/validations.md`).

---

### Juan Leites - 7/7/2026, 20:04:42

## Scope

- Declared amounts are checked against DGI structural constraints (minimums/ranges, once defined) before proceeding to the Tax Rules Engine (capability-level only; no thresholds implied).

---

### Juan Leites - 7/7/2026, 20:04:44

## Out Of Scope

- Currency conversion — no multi-currency requirement documented in any confirmed spec.
- Negative/zero-amount handling — the rule itself is unconfirmed (`07-validator.md`: "¿acepta cero? ¿negativos?" still pendiente); this stays out of scope by necessity until DGI's range rule is defined, not as a product decision.

---


_Synced from Jira by sync-jira-issues_
