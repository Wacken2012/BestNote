// Kamera-Scan mit Tesseract.js OCR für eine PWA
// Nach dem Foto werden erkannte Felder wie Titel und Instrument vorgeschlagen
// Voraussetzung: Tesseract.js ist als globales Script eingebunden oder via npm installiert

export async function scanWithCameraAndOcr() {
  // Kamera öffnen und Foto aufnehmen
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const video = document.createElement('video');
  video.srcObject = stream;
  await video.play();

  // UI: Video anzeigen und Button für Snapshot bereitstellen
  // (Hier nur Logik, UI-Integration in Vue/HTML nötig)
  alert('Bitte richten Sie die Kamera aus und klicken Sie OK, um ein Foto aufzunehmen.');

  // Snapshot erstellen
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  // Kamera stoppen
  stream.getTracks().forEach(track => track.stop());

  // OCR mit Tesseract.js
  const { createWorker } = window.Tesseract;
  const worker = await createWorker();
  await worker.loadLanguage('deu+eng');
  await worker.initialize('deu+eng');
  const { data: { text } } = await worker.recognize(canvas);
  await worker.terminate();

  // Felder extrahieren (z.B. Titel, Instrument)
  const titleMatch = text.match(/Titel[:\s]+(.+)/i);
  const instrumentMatch = text.match(/Instrument[:\s]+(.+)/i);

  return {
    rawText: text,
    title: titleMatch ? titleMatch[1].trim() : '',
    instrument: instrumentMatch ? instrumentMatch[1].trim() : ''
  };
}
