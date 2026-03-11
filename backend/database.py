import os

import pandas as pd
from sqlalchemy import create_engine

DATABASE_URL = "sqlite:///./data/data.db"
os.makedirs("./data", exist_ok=True)

engine = create_engine(DATABASE_URL)

def save_csv_to_db(df: pd.DataFrame, table_name: str="uploaded_data"):
    # Clean column names
    df.columns = [c.replace(' ', '_').replace('.', '').replace('-', '_').lower() for c in df.columns]
    
    # Save to SQLite
    df.to_sql(table_name, con=engine, if_exists='replace', index=False)
    
    # Get schema summary
    schema = {}
    for col, dtype in zip(df.columns, df.dtypes):
        schema[col] = str(dtype)
        
    return schema

def execute_query(query: str):
    try:
        with engine.connect() as conn:
            result = pd.read_sql(query, con=conn)
            return result.to_dict(orient="records"), None
    except Exception as e:
        return None, str(e)
