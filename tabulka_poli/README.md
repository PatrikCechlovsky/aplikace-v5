# Tabulka polí pro implementaci UI
Tento adresář obsahuje CSV soubory, které reprezentují jednotlivé listy Excelu pro přehled polí UI.

Jak vytvořit .xlsx lokálně:
1) Otevřete Excel a importujte jednotlivé CSV přes Data → From Text/CSV, nebo
2) Použijte přiložený Python skript `scripts/csv_to_xlsx.py` (vyžaduje Python 3.8+, pandas, openpyxl):
   - python -m pip install pandas openpyxl
   - python scripts/csv_to_xlsx.py

Po spuštění skriptu se vytvoří `tabulka_poli.xlsx` v kořeni repozitáře.
