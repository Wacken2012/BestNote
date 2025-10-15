from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import os
import tempfile
import platform

router = APIRouter(prefix="/hardware", tags=["hardware"])

# --- SCAN ---
@router.post("/scan")
async def scan_document():
    """Scannt ein Dokument mit dem Standard-Scanner und gibt das Bild als PDF zurück."""
    try:
        temp_dir = tempfile.mkdtemp()
        output_path = os.path.join(temp_dir, "scan.pdf")
        system = platform.system()
        if system == "Linux":
            # Nutze scanimage (SANE) und convert (ImageMagick)
            scan_cmd = f"scanimage --format=png > {temp_dir}/scan.png && convert {temp_dir}/scan.png {output_path}"
            result = os.system(scan_cmd)
        elif system == "Windows":
            # Nutze pyinsane2 für TWAIN/WIA-Scanner
            try:
                from pyinsane2 import Scanner, scan
                import img2pdf
                scanner = Scanner()
                scan_session = scanner.scan(multiple=False)
                for page in scan_session:
                    img_path = os.path.join(temp_dir, "scan.png")
                    page.save(img_path)
                    with open(output_path, "wb") as f:
                        f.write(img2pdf.convert(img_path))
                result = 0
            except Exception as e:
                raise Exception(f"Windows-Scan-Fehler: {e}")
        elif system == "Darwin":
            # macOS: Nutze 'imagescan' (Epson/Canon) oder 'scanimage' falls verfügbar, dann convert
            # ACHTUNG: Diese Logik ist ungetestet!
            scan_cmd = f"scanimage --format=png > {temp_dir}/scan.png && convert {temp_dir}/scan.png {output_path}"
            result = os.system(scan_cmd)
        else:
            raise Exception(f"Nicht unterstütztes Betriebssystem: {system}")
        if result != 0 or not os.path.exists(output_path):
            raise Exception("Scan fehlgeschlagen oder kein Scanner gefunden.")
        return FileResponse(output_path, media_type="application/pdf", filename="scan.pdf")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# --- PRINT ---
@router.post("/print")
async def print_document(file: UploadFile = File(...)):
    """Druckt eine hochgeladene Datei auf dem Standarddrucker."""
    try:
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        system = platform.system()
        if system == "Linux":
            print_cmd = f"lpr {file_path}"
            result = os.system(print_cmd)
        elif system == "Windows":
            try:
                import win32print
                import win32api
                printer_name = win32print.GetDefaultPrinter()
                win32api.ShellExecute(0, "print", file_path, None, ".", 0)
                result = 0
            except Exception as e:
                raise Exception(f"Windows-Druck-Fehler: {e}")
        elif system == "Darwin":
            # macOS: Nutze 'lp' Befehl
            # ACHTUNG: Diese Logik ist ungetestet!
            print_cmd = f"lp {file_path}"
            result = os.system(print_cmd)
        else:
            raise Exception(f"Nicht unterstütztes Betriebssystem: {system}")
        if result != 0:
            raise Exception("Druck fehlgeschlagen oder kein Drucker gefunden.")
        return {"status": "ok", "message": "Druckauftrag gesendet."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
