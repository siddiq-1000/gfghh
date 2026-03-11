import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Initialize the model
# We use gemini-1.5-pro or gemini-2.0-flash depending on availability, defaulting to a stable one
model = genai.GenerativeModel('gemini-1.5-pro')

from typing import Optional

def generate_insights(schema: dict, user_query: str, chat_history: Optional[list] = None) -> dict:
    prompt = f"""
    You are an expert Data Analyst AI for a CXO dashboard.
    
    The user has a database table named 'uploaded_data' with the following schema (columns and data types):
    {json.dumps(schema, indent=2)}
    
    The user's query is: "{user_query}"
    
    Analyze the schema and the query. You MUST output a valid JSON object matching this structure EXACTLY:
    {{
      "sql_query": "A valid SQLite query to fetch the requested data from the 'uploaded_data' table. Ensure column names are quoted if they contain spaces or special characters. If the question cannot be answered by the schema, set this to null. DO NOT hallucinate columns.",
      "chart_type": "The best Recharts chart type to visualize this data (choose from: 'bar', 'line', 'pie', 'scatter', 'area', or 'table' if just a number).",
      "explanation": "A concise, professional 1-2 sentence business insight summarizing what the data shows, tailored for an executive."
    }}
    
    If the user's query is conversational and refers to a previous context, infer the best chart type and SQL query taking the query into account.
    If the question is completely unrelated to the data or uses nonexistent columns, output a null sql_query and a polite explanation.
    
    Return ONLY the raw JSON object. Do not wrap it in markdown block quotes (```json).
    """
    
    try:
        response = model.generate_content(prompt)
        # Attempt to parse as JSON. Might need to strip markdown if the model includes it despite instruction
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return {
            "sql_query": None,
            "chart_type": "table",
            "explanation": "I encountered an error processing your query. Please clarify or try again."
        }
