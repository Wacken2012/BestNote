import { createRouter, createWebHistory } from 'vue-router';

import Dashboard from './components/Dashboard.vue';
import ImportSoftNote from './components/ImportSoftNote.vue';
import ExportCenter from './components/ExportCenter.vue';
import Calendar from './views/Calendar.vue';
import ScanOcrPlaceholder from './components/ScanOcrPlaceholder.vue';
import BackupPlaceholder from './components/BackupPlaceholder.vue';
import ApiLogPlaceholder from './components/ApiLogPlaceholder.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/settings', name: 'SettingsView', component: () => import('./components/SettingsView.vue') },
  { path: '/import', name: 'Import', component: ImportSoftNote },
  { path: '/export', name: 'Export', component: ExportCenter },
  { path: '/calendar', name: 'Calendar', component: Calendar },
  { path: '/scan', name: 'ScanOCR', component: ScanOcrPlaceholder },
  { path: '/backup', name: 'Backup', component: BackupPlaceholder },
  { path: '/api-log', name: 'ApiLog', component: ApiLogPlaceholder },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
