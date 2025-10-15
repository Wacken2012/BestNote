<template>
  <div class="dashboard">
  <h2>BestNote Dashboard</h2>
    <div class="dashboard-tiles">
      <router-link to="/import" class="tile import">
        <span>📥</span>
        <div>Import</div>
      </router-link>
      <router-link to="/export" class="tile export">
        <span>📤</span>
        <div>Export</div>
      </router-link>
      <router-link to="/calendar" class="tile calendar">
        <span>📅</span>
        <div>Kalender</div>
      </router-link>
      <router-link to="/scan" class="tile scan">
        <span>📷</span>
        <div>Scan/OCR</div>
      </router-link>
      <router-link to="/backup" class="tile backup">
        <span>💾</span>
        <div>Backup</div>
      </router-link>
      <router-link to="/api-log" class="tile api-log">
        <span>📝</span>
        <div>API-Log</div>
      </router-link>
      <router-link to="/settings" class="tile settings">
        <span>⚙️</span>
        <div>Einstellungen</div>
      </router-link>
    </div>
    <div class="dashboard-status">
      <div class="status-block">
        <h3>Letzte Importe</h3>
        <ul>
          <li>– (Platzhalter)</li>
        </ul>
      </div>
      <div class="status-block">
        <h3>Nächste Termine</h3>
        <ul>
          <li>– (Platzhalter)</li>
        </ul>
      </div>
      <div class="status-block">
        <h3>Systemstatus</h3>
        <ul>
          <li>– (Platzhalter)</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard'
}
</script>

<style scoped>
.dashboard {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.dashboard-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 2.5rem;
}
.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: #f4f4f4;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  font-size: 1.2rem;
  color: #2c3e50;
  text-decoration: none;
  transition: box-shadow 0.2s, background 0.2s;
  cursor: pointer;
}
.tile span {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}
.tile:hover {
  background: #e0f7fa;
  box-shadow: 0 4px 16px rgba(44,62,80,0.15);
}
.dashboard-status {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}
.status-block {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  padding: 1.2rem 1.5rem;
  min-width: 220px;
  max-width: 300px;
}
.status-block h3 {
  margin-top: 0;
  font-size: 1.1rem;
  color: #1abc9c;
}
.status-block ul {
  margin: 0.5rem 0 0 0;
  padding: 0 0 0 1.2rem;
}
@media (max-width: 700px) {
  .dashboard-tiles {
    gap: 1rem;
  }
  .tile {
    width: 90px;
    height: 90px;
    font-size: 1rem;
  }
  .tile span {
    font-size: 1.5rem;
  }
  .dashboard-status {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>