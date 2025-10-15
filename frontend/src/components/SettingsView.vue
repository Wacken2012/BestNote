<template>
  <div class="settings-view">
    <h2>Einstellungen</h2>
    <nav class="settings-nav">
      <ul>
        <li :class="{active: activeTab === 'mandanten'}" @click="activeTab = 'mandanten'">Mandantenverwaltung</li>
        <li :class="{active: activeTab === 'rechte'}" @click="activeTab = 'rechte'">Benutzer & Rechte</li>
        <!-- Weitere Module können hier ergänzt werden -->
      </ul>
    </nav>
    <div class="settings-content">
      <MandantenVerwaltung v-if="activeTab === 'mandanten'" />
      <RechteVerwaltung v-if="activeTab === 'rechte'" />
      <!-- Weitere Module als Komponenten -->
    </div>
  </div>
</template>

<script>
import MandantenVerwaltung from './MandantenVerwaltung.vue'
import RechteVerwaltung from './RechteVerwaltung.vue'
export default {
  name: 'SettingsView',
  components: { MandantenVerwaltung, RechteVerwaltung },
  data() {
    return {
      activeTab: 'mandanten'
    }
  }
}
</script>

<style scoped>
.settings-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.settings-nav ul {
  display: flex;
  gap: 2rem;
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
}
.settings-nav li {
  cursor: pointer;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  background: #f4f4f4;
  transition: background 0.2s;
}
.settings-nav li.active, .settings-nav li:hover {
  background: #e0f7fa;
  color: #007bff;
}
.settings-content {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  padding: 2rem;
}
</style>
