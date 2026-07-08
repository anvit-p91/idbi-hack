---
name: Wouter Link nesting
description: Wouter's Link component renders an anchor tag — do not wrap in another anchor.
---

**Rule:** Wouter's `<Link>` renders `<a>` by default. Never add an inner `<a>` inside it.

**Why:** Nested anchors cause React hydration errors and browser warnings: `<a> cannot be a descendant of <a>`.

**How to apply:** Apply className and data-testid directly to the `<Link>` element:
```tsx
// WRONG
<Link href="/path"><a className="...">text</a></Link>

// RIGHT
<Link href="/path" className="...">text</Link>
```
