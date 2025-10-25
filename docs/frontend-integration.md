## Frontend integration notes

Small, copy-paste friendly snippets to integrate the new vendor adapters and the `/api/vendor/members` endpoint into the Vue 3 frontend (Composition API).

### 1) Store: fetch vendor members

This example uses a small Vuex/Pinia-style store action. Replace `fetch` with your app's HTTP client (axios, ky, etc.).

```ts
// src/store/vendor.ts (example)
import { ref } from 'vue'

export const vendorMembers = ref([])
export const vendorLoading = ref(false)

export async function fetchVendorMembers(vendor = 'openjverein') {
  vendorLoading.value = true
  try {
    const res = await fetch(`/api/vendor/members?vendor=${vendor}`, {
      headers: { 'x-user-role': 'admin' } // in prod use real auth
    })
    const body = await res.json()
    if (body && body.ok) vendorMembers.value = body.members || []
    return vendorMembers.value
  } finally { vendorLoading.value = false }
}
```

### 2) Roles as chips component (read-only)

Small presentational component showing member roles as chips. Adapt styles to your design system.

```vue
<template>
  <div class="roles">
    <span v-for="r in roles" :key="r" class="chip">{{ r }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ roles: string[] }>()
const props = defineProps<{ roles: string[] }>()
const roles = props.roles || []
</script>

<style scoped>
.chip { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 999px; background:#efefef; margin-right:0.3rem }
</style>
```

### 3) Roles multi-select (assignment)

Example using native `<select multiple>`; replace with your UI framework's component (Element Plus, Vuetify, Naive UI).

```vue
<template>
  <div>
    <label for="roles">Roles</label>
    <select id="roles" multiple v-model="selectedRoles">
      <option v-for="r in allRoles" :key="r" :value="r">{{ r }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const allRoles = ['mitglied','notenwart','dirigent','vorstand','kassierer','admin']
const selectedRoles = ref<string[]>([])

// on save: send to API as roles array
async function saveRoles(memberId: string) {
  await fetch(`/api/members/${memberId}`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ roles: selectedRoles.value })
  })
}
</script>
```

### 4) Notes & best practices

- Use server-side permission filtering: the `/api/vendor/members` route already calls `filterMemberForViewer`, but the frontend must pass a real auth token (JWT) in production.
- Prefer caching adapter results on the server or in the client to avoid repeated file reads for large exports.
- If you need full vendor import/merge UI, implement paginated fetches and server-side rate limiting.

If you'd like, I can add an example Vue component that lists vendor members and uses the `roles-as-chips` component.
