from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from sentence_transformers import SentenceTransformer
import logging

# Initialize FastAPI app
app = FastAPI(title="Libro Embedding Service")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load model at startup to keep it warm in memory
# nomic-ai/nomic-embed-text-v1.5 is a leading open 768-dim model
# Use trust_remote_code=True as required by nomic
MODEL_NAME = "nomic-ai/nomic-embed-text-v1.5"
logger.info(f"Loading embedding model: {MODEL_NAME}...")
model = SentenceTransformer(MODEL_NAME, trust_remote_code=True)
logger.info("Model loaded successfully. Ready to serve embeddings.")

class EmbedRequest(BaseModel):
    text: str
    task_type: str = "search_document" # required prefix for nomic

class EmbedResponse(BaseModel):
    embedding: List[float]
    dimensions: int

@app.post("/embed", response_model=EmbedResponse)
async def embed(req: EmbedRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    try:
        # Nomic requires task prefixes: 'search_query: ' for queries, 'search_document: ' for docs
        prefix = f"{req.task_type}: "
        embeddings = model.encode([prefix + req.text], normalize_embeddings=True)
        vec = embeddings[0].tolist()
        return EmbedResponse(embedding=vec, dimensions=len(vec))
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL_NAME, "dimensions": 768}
