// Offline-Workflow-Speicherung und Synchronisierung mit IndexedDB
// Speichert Workflow-Schritte lokal, wenn offline, und synchronisiert sie bei Verbindung
// Nutzt idb-keyval (https://www.npmjs.com/package/idb-keyval) für einfache IndexedDB-Nutzung

import { set, get, del, update, keys } from 'idb-keyval';

const WORKFLOW_STORE = 'offline-workflows';

export async function saveWorkflowStepOffline(step) {
  const all = (await get(WORKFLOW_STORE)) || [];
  all.push({ ...step, timestamp: Date.now() });
  await set(WORKFLOW_STORE, all);
}

export async function getOfflineWorkflowSteps() {
  return (await get(WORKFLOW_STORE)) || [];
}

export async function clearOfflineWorkflowSteps() {
  await del(WORKFLOW_STORE);
}

export async function syncOfflineWorkflows(syncFn) {
  // syncFn ist eine Funktion, die einen einzelnen Schritt an den Server sendet
  const steps = await getOfflineWorkflowSteps();
  if (!steps.length) return;
  for (const step of steps) {
    try {
      await syncFn(step);
    } catch (e) {
      // Bei Fehler abbrechen, später erneut versuchen
      return;
    }
  }
  await clearOfflineWorkflowSteps();
}

// Automatische Synchronisierung bei Online-Event
window.addEventListener('online', () => {
  // syncOfflineWorkflows muss mit einer passenden syncFn aus dem App-Kontext aufgerufen werden
  // Beispiel: syncOfflineWorkflows(apiSyncFunction)
});
