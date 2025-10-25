<template>
  <div class="library-item">
    <div class="meta">
      <h3>{{ piece.title }}</h3>
      <p>{{ piece.composer }} · {{ piece.voice }}</p>
    </div>
    <div class="tags">
      <span v-for="t in piece.tags" :key="t" class="tag">{{ t }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'

type Piece = { id: string; title: string; composer: string; voice: string; tags: string[] }
const props = defineProps<{ piece: Piece }>()
</script>

<style scoped>
.library-item { border:1px solid #e0e0e0; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center }
.tags .tag { background:#eee; padding:4px 8px; margin-left:6px; border-radius:6px }
</style>
