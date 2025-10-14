import zipfile
import json
import os
import shutil
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

class BackupService:
    def __init__(self, backup_dir: str = '/tmp/bestnote_backups'):
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(exist_ok=True)

    def create_backup(self, mandant_id: int, include_files: bool = True, include_database: bool = True) -> Dict[str, Any]:
        """Erstellt ein vollständiges Backup für einen Mandanten"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'backup_mandant_{mandant_id}_{timestamp}.zip'
        backup_path = self.backup_dir / backup_filename

        try:
            with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Metadaten hinzufügen
                metadata = self._create_backup_metadata(mandant_id, timestamp, include_files, include_database)
                zipf.writestr('backup_metadata.json', json.dumps(metadata, indent=2, ensure_ascii=False))

                if include_database:
                    # Datenbank-Dump (simuliert)
                    db_data = self._export_database_data(mandant_id)
                    zipf.writestr('database_export.json', json.dumps(db_data, indent=2, ensure_ascii=False))

                if include_files:
                    # Dateien hinzufügen (simuliert)
                    self._add_files_to_backup(zipf, mandant_id)

            backup_size = backup_path.stat().st_size

            return {
                'success': True,
                'filename': backup_filename,
                'path': str(backup_path),
                'size': backup_size,
                'timestamp': timestamp,
                'mandant_id': mandant_id
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'Backup-Fehler: {str(e)}',
                'mandant_id': mandant_id
            }

    def restore_backup(self, backup_path: str, mandant_id: int, restore_options: Dict[str, bool]) -> Dict[str, Any]:
        """Stellt ein Backup wieder her"""
        try:
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                # Metadaten prüfen
                if 'backup_metadata.json' not in zipf.namelist():
                    return {'success': False, 'error': 'Ungültiges Backup-Format'}

                metadata = json.loads(zipf.read('backup_metadata.json').decode('utf-8'))

                if metadata['mandant_id'] != mandant_id:
                    return {'success': False, 'error': 'Backup gehört zu einem anderen Mandanten'}

                restore_results = {
                    'database_restored': False,
                    'files_restored': False,
                    'errors': []
                }

                # Temporäres Verzeichnis für Extraktion
                extract_dir = self.backup_dir / f'restore_temp_{mandant_id}_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
                extract_dir.mkdir()

                try:
                    zipf.extractall(extract_dir)

                    # Datenbank wiederherstellen
                    if restore_options.get('database', True) and 'database_export.json' in zipf.namelist():
                        db_result = self._restore_database_data(extract_dir / 'database_export.json', mandant_id)
                        restore_results['database_restored'] = db_result['success']
                        if not db_result['success']:
                            restore_results['errors'].append(f'Datenbank-Import fehlgeschlagen: {db_result["error"]}')

                    # Dateien wiederherstellen
                    if restore_options.get('files', True):
                        files_result = self._restore_files(extract_dir, mandant_id)
                        restore_results['files_restored'] = files_result['success']
                        if not files_result['success']:
                            restore_results['errors'].append(f'Datei-Import fehlgeschlagen: {files_result["error"]}')

                finally:
                    # Aufräumen
                    shutil.rmtree(extract_dir, ignore_errors=True)

            return {
                'success': True,
                'restore_results': restore_results,
                'backup_info': metadata
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'Restore-Fehler: {str(e)}'
            }

    def import_softnote_backup(self, softnote_zip_path: str, mandant_id: int) -> Dict[str, Any]:
        """Importiert ein SoftNote-kompatibles Backup"""
        try:
            import_results = {
                'scores_imported': 0,
                'files_imported': 0,
                'errors': []
            }

            with zipfile.ZipFile(softnote_zip_path, 'r') as zipf:
                # SoftNote-Format erkennen und konvertieren
                file_list = zipf.namelist()

                # CSV-Dateien suchen
                csv_files = [f for f in file_list if f.endswith('.csv')]
                for csv_file in csv_files:
                    try:
                        csv_content = zipf.read(csv_file).decode('utf-8')
                        scores = self._parse_softnote_csv(csv_content)
                        import_results['scores_imported'] += len(scores)
                    except Exception as e:
                        import_results['errors'].append(f'Fehler beim Import von {csv_file}: {str(e)}')

                # PDF-Dateien extrahieren
                pdf_files = [f for f in file_list if f.endswith('.pdf')]
                for pdf_file in pdf_files:
                    try:
                        # Simuliere Datei-Import
                        import_results['files_imported'] += 1
                    except Exception as e:
                        import_results['errors'].append(f'Fehler beim Import von {pdf_file}: {str(e)}')

            return {
                'success': True,
                'import_results': import_results
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'SoftNote-Import fehlgeschlagen: {str(e)}'
            }

    def list_backups(self, mandant_id: int) -> List[Dict[str, Any]]:
        """Listet alle verfügbaren Backups für einen Mandanten"""
        backups = []
        pattern = f'backup_mandant_{mandant_id}_*.zip'

        for backup_file in self.backup_dir.glob(pattern):
            try:
                with zipfile.ZipFile(backup_file, 'r') as zipf:
                    if 'backup_metadata.json' in zipf.namelist():
                        metadata = json.loads(zipf.read('backup_metadata.json').decode('utf-8'))
                        backups.append({
                            'filename': backup_file.name,
                            'path': str(backup_file),
                            'size': backup_file.stat().st_size,
                            'created_at': metadata.get('timestamp'),
                            'includes_files': metadata.get('include_files', False),
                            'includes_database': metadata.get('include_database', False)
                        })
            except Exception:
                continue

        # Nach Erstellungsdatum sortieren (neueste zuerst)
        backups.sort(key=lambda x: x['created_at'], reverse=True)
        return backups

    def delete_backup(self, backup_filename: str, mandant_id: int) -> bool:
        """Löscht ein Backup"""
        backup_path = self.backup_dir / backup_filename

        # Sicherheitsprüfung: Dateiname muss zum Mandanten passen
        if not backup_filename.startswith(f'backup_mandant_{mandant_id}_'):
            return False

        try:
            backup_path.unlink()
            return True
        except Exception:
            return False

    def _create_backup_metadata(self, mandant_id: int, timestamp: str, include_files: bool, include_database: bool) -> Dict[str, Any]:
        """Erstellt Metadaten für das Backup"""
        return {
            'version': '1.0',
            'mandant_id': mandant_id,
            'timestamp': timestamp,
            'created_at': datetime.now().isoformat(),
            'include_files': include_files,
            'include_database': include_database,
            'backup_type': 'full' if include_files and include_database else 'partial'
        }

    def _export_database_data(self, mandant_id: int) -> Dict[str, Any]:
        """Exportiert Datenbank-Daten (simuliert)"""
        # Hier würde die echte Datenbank-Abfrage erfolgen
        return {
            'mandant': {'id': mandant_id, 'name': f'Mandant {mandant_id}'},
            'scores': [
                {'id': 1, 'title': 'Beethoven - Symphonie Nr. 5', 'composer': 'Ludwig van Beethoven'},
                {'id': 2, 'title': 'Mozart - Zauberflöte', 'composer': 'Wolfgang Amadeus Mozart'}
            ],
            'export_timestamp': datetime.now().isoformat()
        }

    def _add_files_to_backup(self, zipf: zipfile.ZipFile, mandant_id: int):
        """Fügt Dateien zum Backup hinzu (simuliert)"""
        # Hier würden echte Dateien hinzugefügt werden
        # Für Demo: Platzhalter-Dateien erstellen
        placeholder_content = f'Platzhalter für Mandant {mandant_id}'
        zipf.writestr(f'files/mandant_{mandant_id}/readme.txt', placeholder_content)

    def _restore_database_data(self, db_file_path: Path, mandant_id: int) -> Dict[str, Any]:
        """Stellt Datenbank-Daten wieder her (simuliert)"""
        try:
            with open(db_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Hier würde die echte Datenbank-Import-Logik erfolgen
            return {'success': True, 'records_imported': len(data.get('scores', []))}

        except Exception as e:
            return {'success': False, 'error': str(e)}

    def _restore_files(self, extract_dir: Path, mandant_id: int) -> Dict[str, Any]:
        """Stellt Dateien wieder her (simuliert)"""
        try:
            files_dir = extract_dir / 'files'
            if files_dir.exists():
                # Hier würde die echte Datei-Import-Logik erfolgen
                return {'success': True, 'files_restored': 5}
            return {'success': True, 'files_restored': 0}

        except Exception as e:
            return {'success': False, 'error': str(e)}

    def _parse_softnote_csv(self, csv_content: str) -> List[Dict[str, Any]]:
        """Parst SoftNote CSV-Format"""
        import csv
        from io import StringIO

        scores = []
        reader = csv.DictReader(StringIO(csv_content))

        for row in reader:
            score = {
                'title': row.get('Titel', ''),
                'composer': row.get('Komponist', ''),
                'year': row.get('Jahr', ''),
                'metadata': row.get('Metadaten', '')
            }
            scores.append(score)

        return scores