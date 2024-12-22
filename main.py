from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
import io

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your frontend URL if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Initialize Sentiment Analyzer
analyzer = SentimentIntensityAnalyzer()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sentiment Analysis API!"}

@app.post("/analyze/")
async def analyze_csv(file: UploadFile):
    # Ensure the file is a CSV
    if file.content_type != "text/csv":
        raise HTTPException(status_code=400, detail="File must be a CSV.")
    
    # Read the CSV file
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid CSV format.")

    # Check required columns
    if "text" not in df.columns:
        raise HTTPException(status_code=400, detail="CSV must contain a 'text' column.")

    # Perform sentiment analysis
    sentiments = []
    for text in df["text"]:
        scores = analyzer.polarity_scores(str(text))
        sentiments.append({
            "text": text,
            "positive": scores["pos"],
            "neutral": scores["neu"],
            "negative": scores["neg"],
            "compound": scores["compound"]
        })

    return {"sentiments": sentiments}
