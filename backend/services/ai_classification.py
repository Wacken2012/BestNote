import os
import re
from typing import Dict, List, Any, Optional
from pathlib import Path

class AIClassificationService:
    def __init__(self):
        # Genre-Klassifikation basierend auf Schlüsselwörtern
        self.genre_keywords = {
            'klassisch': ['symphonie', 'konzert', 'sonate', 'quartett', 'sinfonie', 'op.', 'opus', 'beethoven', 'mozart', 'bach', 'haydn', 'schubert'],
            'romantisch': ['romanze', 'nocturne', 'etüde', 'prelude', 'impromptu', 'chopin', 'liszt', 'schumann', 'brahms', 'wagner'],
            'barock': ['suite', 'concerto', 'brandenburg', 'bach', 'handel', 'vivaldi', 'telemann'],
            'modern': ['zwölfton', 'atonale', 'seriell', 'aleatorik', 'elektronisch', 'experimentell'],
            'volksmusik': ['volkslied', 'tanz', 'ländler', 'walzer', 'polka', 'marsch'],
            'kirchenmusik': ['messe', 'motette', 'kantate', 'oratorium', 'requiem', 'psalm', 'hymnus']
        }

        # Schwierigkeitsgrade basierend auf technischen Begriffen
        self.difficulty_indicators = {
            'leicht': ['anfänger', 'leicht', 'einfach', 'grundstufe', 'elementar'],
            'mittel': ['mittel', 'fortgeschritten', 'intermediate', 'mäßig'],
            'schwer': ['schwer', 'virtuos', 'komplex', 'fortgeschritten', 'meister', 'konzert', 'solistisch']
        }

        # Instrumente und Besetzung
        self.instrument_keywords = {
            'streicher': ['violine', 'viola', 'violoncello', 'kontrabass', 'streicher', 'string'],
            'bläser': ['flöte', 'oboe', 'klarinette', 'fagott', 'horn', 'trompete', 'posaune', 'tuba', 'bläser', 'woodwind', 'brass'],
            'schlagwerk': ['pauke', 'schlagzeug', 'trommel', 'becken', 'triangel', 'percussion'],
            'tasteninstrumente': ['klavier', 'cembalo', 'orgel', 'piano', 'organ', 'harpsichord'],
            'zupfinstrumente': ['gitarre', 'harfe', 'mandoline', 'guitar', 'harp']
        }

    def analyze_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Analysiert ein PDF und extrahiert Metadaten mittels OCR und KI-Klassifikation"""
        try:
            # PDF-Text extrahieren
            text = self._extract_text_from_pdf(pdf_path)

            # Metadaten analysieren
            analysis = {
                'title': self._extract_title(text),
                'composer': self._extract_composer(text),
                'genre': self._classify_genre(text),
                'difficulty': self._classify_difficulty(text),
                'instruments': self._extract_instruments(text),
                'ensemble_size': self._estimate_ensemble_size(text),
                'confidence': self._calculate_confidence(text),
                'raw_text_sample': text[:500] if text else ''
            }

            return analysis

        except Exception as e:
            return {
                'error': f'PDF-Analyse fehlgeschlagen: {str(e)}',
                'confidence': 0
            }

    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extrahiert Text aus PDF mittels PyMuPDF und OCR als Fallback"""
        try:
            import fitz  # PyMuPDF für PDF-Verarbeitung
        except ImportError:
            raise ImportError("PyMuPDF (fitz) ist nicht installiert. Installieren Sie es mit: pip install PyMuPDF")

        text = ""

        try:
            # Versuche zuerst direkte Textextraktion
            with fitz.open(pdf_path) as doc:
                for page in doc:
                    page_text = page.get_text()
                    text += page_text + "\n"

            # Wenn wenig Text gefunden wurde, verwende OCR
            if len(text.strip()) < 100:
                text = self._ocr_pdf(pdf_path)

        except Exception as e:
            # Fallback auf OCR
            text = self._ocr_pdf(pdf_path)

        return text.lower()

    def _ocr_pdf(self, pdf_path: str) -> str:
        """Führt OCR auf PDF-Seiten durch"""
        try:
            import fitz  # PyMuPDF für PDF-Verarbeitung
            import pytesseract
            from PIL import Image
            import io
        except ImportError as e:
            return f"OCR-Abhängigkeiten fehlen: {str(e)}"

        text = ""

        try:
            with fitz.open(pdf_path) as doc:
                for page_num in range(min(5, len(doc))):  # Nur erste 5 Seiten
                    page = doc[page_num]
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x Auflösung

                    # Konvertiere zu PIL Image
                    img_data = pix.tobytes("png")
                    img = Image.open(io.BytesIO(img_data))

                    # OCR durchführen
                    page_text = pytesseract.image_to_string(img, lang='deu+eng')
                    text += page_text + "\n"

        except Exception as e:
            return f"OCR fehlgeschlagen: {str(e)}"

        return text

    def _extract_title(self, text: str) -> Optional[str]:
        """Extrahiert den Titel aus dem Text"""
        # Suche nach typischen Titel-Patterns
        patterns = [
            r'(?:titel|title)[:\s]*([^\n\r]{10,80})',
            r'^([^\n\r]{10,50})$',  # Erste Zeile als Titel
            r'([A-Z][^.!?\n\r]{15,60}[.!?])'  # Satz mit Großbuchstabe
        ]

        for pattern in patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
            if matches:
                title = matches[0].strip()
                # Bereinige von Sonderzeichen
                title = re.sub(r'[^\w\s\-.,]', '', title)
                return title[:100]  # Begrenze Länge

        return None

    def _extract_composer(self, text: str) -> Optional[str]:
        """Extrahiert den Komponisten aus dem Text"""
        # Bekannte Komponisten
        composers = [
            'beethoven', 'mozart', 'bach', 'haydn', 'schubert', 'brahms', 'wagner',
            'chopin', 'liszt', 'schumann', 'handel', 'vivaldi', 'telemann', 'debussy',
            'ravel', 'strauss', 'mahler', 'bruckner', 'dvorak', 'tschaikowsky'
        ]

        for composer in composers:
            if composer in text:
                return composer.title()

        # Suche nach "von" oder "by" Pattern
        patterns = [
            r'(?:von|by|komponist)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s*\(\d{4}\s*-\s*\d{4}\))'
        ]

        for pattern in patterns:
            matches = re.findall(pattern, text)
            if matches:
                return matches[0].strip()

        return None

    def _classify_genre(self, text: str) -> str:
        """Klassifiziert das Genre basierend auf Schlüsselwörtern"""
        scores = {}

        for genre, keywords in self.genre_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                scores[genre] = score

        if scores:
            return max(scores, key=lambda x: scores[x])

        return 'unbekannt'

    def _classify_difficulty(self, text: str) -> str:
        """Klassifiziert den Schwierigkeitsgrad"""
        scores = {}

        for difficulty, indicators in self.difficulty_indicators.items():
            score = sum(1 for indicator in indicators if indicator in text)
            if score > 0:
                scores[difficulty] = score

        if scores:
            return max(scores, key=lambda x: scores[x])

        # Fallback: basierend auf technischer Komplexität
        complex_indicators = ['divisi', 'soli', 'tutti', 'accelerando', 'ritardando', 'crescendo', 'diminuendo']
        complex_score = sum(1 for indicator in complex_indicators if indicator in text)

        if complex_score > 3:
            return 'schwer'
        elif complex_score > 1:
            return 'mittel'

        return 'unbekannt'

    def _extract_instruments(self, text: str) -> List[str]:
        """Extrahiert erwähnte Instrumente"""
        instruments = []

        for category, keywords in self.instrument_keywords.items():
            for keyword in keywords:
                if keyword in text and keyword not in instruments:
                    instruments.append(keyword)

        return instruments[:10]  # Begrenze auf 10 Instrumente

    def _estimate_ensemble_size(self, text: str) -> str:
        """Schätzt die Ensemble-Größe"""
        size_indicators = {
            'solo': ['solo', 'solist'],
            'kammerensemble': ['duo', 'trio', 'quartett', 'quintett', 'sextett'],
            'kleines_orchester': ['kleines orchester', 'kammerorchester', 'sinfonietta'],
            'großes_orchester': ['orchester', 'sinfonie', 'philharmonie', 'symphony']
        }

        for size, indicators in size_indicators.items():
            if any(indicator in text for indicator in indicators):
                return size

        # Fallback basierend auf Instrumenten-Anzahl
        instrument_count = len(self._extract_instruments(text))
        if instrument_count == 1:
            return 'solo'
        elif instrument_count <= 5:
            return 'kammerensemble'
        elif instrument_count <= 20:
            return 'kleines_orchester'
        else:
            return 'großes_orchester'

    def _calculate_confidence(self, text: str) -> float:
        """Berechnet die Konfidenz der Analyse"""
        if not text:
            return 0.0

        # Faktoren für Konfidenz
        confidence = 0.5  # Basis-Konfidenz

        # Mehr Text = höhere Konfidenz
        if len(text) > 1000:
            confidence += 0.2
        elif len(text) > 500:
            confidence += 0.1

        # Spezifische Musik-Begriffe erhöhen Konfidenz
        music_terms = ['noten', 'takt', 'tonart', 'tempo', 'andante', 'allegro', 'piano', 'forte']
        music_score = sum(1 for term in music_terms if term in text)
        confidence += min(music_score * 0.05, 0.2)

        # Bekannte Komponisten erhöhen Konfidenz
        composer_found = self._extract_composer(text) is not None
        if composer_found:
            confidence += 0.1

        return min(confidence, 1.0)

    def batch_analyze(self, pdf_paths: List[str]) -> List[Dict[str, Any]]:
        """Analysiert mehrere PDFs auf einmal"""
        results = []
        for pdf_path in pdf_paths:
            try:
                analysis = self.analyze_pdf(pdf_path)
                analysis['file_path'] = pdf_path
                results.append(analysis)
            except Exception as e:
                results.append({
                    'file_path': pdf_path,
                    'error': str(e),
                    'confidence': 0
                })

        return results