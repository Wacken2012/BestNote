import zipfile
import os
from typing import List, Dict, Any
from datetime import datetime

class ExportService:
    def __init__(self):
        self.layouts = {
            'standard': {
                'name': 'Standard-Layout',
                'description': 'Klassisches Notenlayout mit Titelseite'
            },
            'compact': {
                'name': 'Kompakt-Layout',
                'description': 'Platzsparendes Layout ohne Titelseite'
            },
            'digital': {
                'name': 'Digital-Optimiert',
                'description': 'Für Bildschirmdarstellung optimiert'
            }
        }

    def get_available_layouts(self) -> Dict[str, Dict[str, str]]:
        """Gibt verfügbare Layouts zurück"""
        return self.layouts

    def create_export_zip(self, mandant_id: int, layout: str = 'standard', include_pdfs: bool = True, include_metadata: bool = True) -> str:
        """Erstellt ZIP-Datei für Export im festen Verzeichnis /tmp/bestnote_exports/"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        export_dir = f'/tmp/bestnote_export_{mandant_id}_{timestamp}'
        zip_dir = '/tmp/bestnote_exports'
        os.makedirs(export_dir, exist_ok=True)
        os.makedirs(zip_dir, exist_ok=True)
        zip_filename = f'export_mandant_{mandant_id}_{layout}_{timestamp}.zip'
        zip_path = os.path.join(zip_dir, zip_filename)

        try:
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Metadaten hinzufügen
                if include_metadata:
                    metadata = self._generate_metadata(mandant_id, layout)
                    metadata_path = os.path.join(export_dir, 'metadata.json')
                    with open(metadata_path, 'w', encoding='utf-8') as f:
                        f.write(metadata)
                    zipf.write(metadata_path, 'metadata.json')

                # Layout-spezifische Dateien hinzufügen
                if layout == 'standard':
                    self._add_standard_layout(zipf, export_dir, mandant_id)
                elif layout == 'compact':
                    self._add_compact_layout(zipf, export_dir, mandant_id)
                elif layout == 'digital':
                    self._add_digital_layout(zipf, export_dir, mandant_id)

                # PDFs hinzufügen (falls verfügbar)
                if include_pdfs:
                    self._add_pdf_files(zipf, mandant_id)

            return zip_path

        finally:
            # Aufräumen temporärer Dateien
            import shutil
            if os.path.exists(export_dir):
                shutil.rmtree(export_dir)

    def _generate_metadata(self, mandant_id: int, layout: str) -> str:
        """Generiert Metadaten für Export"""
        import json
        metadata = {
            'mandant_id': mandant_id,
            'layout': layout,
            'export_date': datetime.now().isoformat(),
            'version': '1.0',
            'description': f'BestNote Export für Mandant {mandant_id} mit Layout {layout}'
        }
        return json.dumps(metadata, indent=2, ensure_ascii=False)

    def _add_standard_layout(self, zipf: zipfile.ZipFile, export_dir: str, mandant_id: int):
        """Fügt Standard-Layout-Dateien hinzu"""
        # Titelseite erstellen
        title_page = os.path.join(export_dir, 'README.txt')
        with open(title_page, 'w', encoding='utf-8') as f:
            f.write(f'BestNote Export - Mandant {mandant_id}\n')
            f.write('Standard-Layout\n\n')
            f.write('Dieses Archiv enthält alle Noten und Stimmen.\n')
        zipf.write(title_page, 'README.txt')

        # Index-Datei
        index = os.path.join(export_dir, 'index.html')
        with open(index, 'w', encoding='utf-8') as f:
            f.write('<html><body><h1>Notenarchiv</h1><p>Index wird hier generiert...</p></body></html>')
        zipf.write(index, 'index.html')

    def _add_compact_layout(self, zipf: zipfile.ZipFile, export_dir: str, mandant_id: int):
        """Fügt Kompakt-Layout-Dateien hinzu"""
        # Minimale README
        readme = os.path.join(export_dir, 'README.txt')
        with open(readme, 'w', encoding='utf-8') as f:
            f.write(f'BestNote Export - Mandant {mandant_id} (Kompakt)\n')
        zipf.write(readme, 'README.txt')

    def _add_digital_layout(self, zipf: zipfile.ZipFile, export_dir: str, mandant_id: int):
        """Fügt Digital-optimiertes Layout hinzu"""
        # Digital-optimierte Index-Datei
        index = os.path.join(export_dir, 'index.html')
        with open(index, 'w', encoding='utf-8') as f:
            f.write('''<html>
<head><style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;}</style></head>
<body><h1>BestNote Digital Archiv</h1><p>Optimiert für Bildschirmdarstellung</p></body>
</html>''')
        zipf.write(index, 'index.html')

    def _add_pdf_files(self, zipf: zipfile.ZipFile, mandant_id: int):
        """Fügt PDF-Dateien aus mandant-spezifischem Verzeichnis hinzu"""
        # Mandant-spezifisches Verzeichnis für importierte Dateien
        mandant_dir = f'/tmp/bestnote_data/mandant_{mandant_id}'

        if os.path.exists(mandant_dir):
            # Alle PDF-Dateien im Mandanten-Verzeichnis finden
            for root, dirs, files in os.walk(mandant_dir):
                for file in files:
                    if file.endswith('.pdf'):
                        file_path = os.path.join(root, file)
                        # Relativer Pfad im ZIP
                        rel_path = os.path.relpath(file_path, mandant_dir)
                        zipf.write(file_path, f'pdfs/{rel_path}')
        else:
            # Fallback: Platzhalter-Datei wenn keine PDFs vorhanden
            placeholder = '/tmp/placeholder.pdf'
            with open(placeholder, 'w') as f:
                f.write('PDF Placeholder - keine Dateien gefunden')
            zipf.write(placeholder, 'pdfs/placeholder.txt')

    def get_export_history(self, mandant_id: int) -> List[Dict[str, Any]]:
        """Gibt Export-Historie zurück"""
        # Platzhalter für Export-Historie
        return [
            {
                'id': 1,
                'date': '2024-01-15T10:30:00',
                'layout': 'standard',
                'file_size': '2.5 MB',
                'status': 'completed'
            },
            {
                'id': 2,
                'date': '2024-01-10T14:20:00',
                'layout': 'compact',
                'file_size': '1.8 MB',
                'status': 'completed'
            }
        ]