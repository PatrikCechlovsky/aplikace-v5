import os
import pandas as pd

INPUT_DIR = 'tabulka_poli'
OUTPUT_FILE = 'tabulka_poli.xlsx'

sheets = ['Fields_Master','Units','Properties','Owners','Tenants','Lookup_Lists']

with pd.ExcelWriter(OUTPUT_FILE, engine='openpyxl') as writer:
    for sheet in sheets:
        csv_path = os.path.join(INPUT_DIR, f'{sheet}.csv')
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
            df.to_excel(writer, sheet_name=sheet, index=False)

print(f'Created {OUTPUT_FILE}')