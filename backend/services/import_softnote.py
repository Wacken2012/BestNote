import csv
import zipfile
import os
from typing import List, Dict, Any, Optional
from backend.models import Score, Part, PartFile

class SoftNoteImportService:
    def __init__(self):
        self.mapping = {
            'title': 'Titel',
            'composer': 'Komponist',
            'year': 'Jahr',
            'metadata': 'Metadaten'
        }

    def validate_csv(self, csv_content: str) -> bool:
        """Validiert CSV-Format aus SoftNote"""
        try:
            reader = csv.DictReader(csv_content.splitlines())
            required_fields = ['Titel', 'Komponist']
            headers = reader.fieldnames
            if headers is None:
                return False
            return all(field in headers for field in required_fields)
        except Exception:
            return False

    def parse_csv(self, csv_content: str, mandant_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Parst CSV und mappt zu Score-Objekten mit optionaler Mandant-Verknüpfung"""
        reader = csv.DictReader(csv_content.splitlines())
        scores = []

        for row in reader:
            score = Score(
                title=row.get('Titel', ''),
                composer=row.get('Komponist', ''),
                year=row.get('Jahr', ''),
                metadata=row.get('Metadaten', '')
            )
            if mandant_id is not None:
                score.mandant_id = mandant_id  # Mandant-spezifische Speicherung
            scores.append(score.dict())

        return scores

    def extract_zip(self, zip_path: str, extract_to: str, mandant_id: int) -> List[str]:
        """Extrahiert ZIP-Datei in mandant-spezifisches Verzeichnis"""
        # Mandant-spezifisches Verzeichnis erstellen
        mandant_dir = os.path.join(extract_to, f"mandant_{mandant_id}")
        os.makedirs(mandant_dir, exist_ok=True)

        extracted_files = []

        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            for file_info in zip_ref.filelist:
                if file_info.filename.endswith(('.pdf', '.mid', '.xml')):
                    zip_ref.extract(file_info, mandant_dir)
                    extracted_files.append(os.path.join(mandant_dir, file_info.filename))

        return extracted_files

    def preview_import(self, file_path: str, mandant_id: Optional[int] = None) -> Dict[str, Any]:
        """Erstellt Vorschau für Import-Datei"""
        if file_path.endswith('.csv'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            is_valid = self.validate_csv(content)
            scores = self.parse_csv(content, mandant_id) if is_valid else []
            return {
                'type': 'csv',
                'valid': is_valid,
                'scores': scores,
                'total_scores': len(scores)
            }
        elif file_path.endswith('.zip'):
            # Für ZIP-Dateien eine einfache Vorschau
            try:
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    files = [f.filename for f in zip_ref.filelist]
                return {
                    'type': 'zip',
                    'valid': True,
                    'files': files,
                    'total_files': len(files)
                }
            except Exception:
                return {
                    'type': 'zip',
                    'valid': False,
                    'error': 'Ungültiges ZIP-Format'
                }
        else:
            return {
                'type': 'unknown',
                'valid': False,
                'error': 'Nicht unterstütztes Format'
            }

    def import_data(self, file_path: str, mandant_id: int) -> Dict[str, Any]:
        """Führt den Import durch"""
        preview = self.preview_import(file_path)

        if not preview['valid']:
            return {'success': False, 'error': 'Ungültige Datei'}

        # Hier würde die eigentliche Import-Logik erfolgen
        # Für jetzt nur eine Bestätigung zurückgeben
        return {
            'success': True,
            'imported_scores': preview.get('total_scores', 0),
            'imported_files': preview.get('total_files', 0),
            'mandant_id': mandant_id
        }