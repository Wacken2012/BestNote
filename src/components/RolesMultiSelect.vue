<template>
  <div>
    <label :for="id">{{ label }}</label>
    <select :id="id" multiple v-model="internal" @change="emitChange">
      <option v-for="r in allRoles" :key="r" :value="r">{{ r }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRefs } from 'vue'
const props = defineProps<{ modelValue: string[]; id?: string; label?: string }>()
const emit = defineEmits(['update:modelValue'])
const { modelValue } = toRefs(props)
const internal = ref<string[]>(modelValue.value || [])
const id = props.id || 'roles-select'
const label = props.label || 'Roles'
const allRoles = ['mitglied','notenwart','dirigent','vorstand','kassierer','admin']

watch(modelValue, (v) => internal.value = v || [])
function emitChange() { emit('update:modelValue', internal.value) }
</script>
