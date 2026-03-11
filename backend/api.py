from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
from database import save_csv_to_db, execute_query
from pydantic import BaseModel

router = APIRouter()

# Store schema globally for simple implementation
current_schema = {}

class QueryRequest(BaseModel):
    query: str
    chat_history: list = []

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    global current_schema
    try:
        contents = await file.read()
        try:
            df = pd.read_csv(io.BytesIO(contents), encoding='utf-8')
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(io.BytesIO(contents), encoding='latin1')
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error parsing CSV file: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing CSV file: {str(e)}")
        
        # Save to DB
        schema = save_csv_to_db(df, "uploaded_data")
        current_schema = schema
        
        return {
            "message": "File uploaded and data stored successfully.",
            "schema": schema,
            "rows_inserted": len(df)
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

from ai_agent import generate_insights

@router.post("/query")
async def process_query(req: QueryRequest):
    global current_schema
    if not current_schema:
        raise HTTPException(status_code=400, detail="Please upload a CSV file first.")
        
    # Generate insights from Gemini
    insights = generate_insights(current_schema, req.query, req.chat_history)
    
    if insights.get("sql_query"):
        # Execute the generated SQL
        data, error = execute_query(insights["sql_query"])
        if error:
            return {
                "error": f"SQL Execution Error: {error}",
                "data": [],
                "chart_type": "none",
                "explanation": "I tried to query the data, but the generated SQL was invalid."
            }
        
        return {
            "data": data,
            "chart_type": insights.get("chart_type", "table"),
            "explanation": insights.get("explanation", "")
        }
    else:
        return {
            "data": [],
            "chart_type": "none",
            "explanation": insights.get("explanation", "I couldn't process that query.")
        }

