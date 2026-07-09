---
name: Generated hook usage pattern
description: Correct way to call orval-generated React Query hooks in the Tabdeel frontend.
---

## Rule
Orval hooks with query params take **two separate arguments**:
1. Params object matching the OpenAPI parameters (e.g., `{ type: 'received', limit: 8 }`)
2. Options object with a `query` key for React Query config (requires `queryKey`)

```tsx
// ✅ CORRECT
const { data } = useGetListings(
  { limit: 8, q: 'keyword' },
  { query: { queryKey: getGetListingsQueryKey({ limit: 8, q: 'keyword' }) } }
);

// ✅ CORRECT (hooks with no params)
const { data } = useGetMe({
  query: { retry: false, queryKey: getGetMeQueryKey() }
});

// ❌ WRONG – params wrapped in a `query` key
const { data } = useGetListings({ query: { queryKey: [...] } });
// ❌ WRONG – missing queryKey causes TS2741
const { data } = useGetMe({ query: { enabled: true } });
```

**Why:** The first arg maps to OpenAPI query/path parameters. The second arg is passed to `useQuery`. Mixing them causes TS2353 or TS2741.
