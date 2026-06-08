import os
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from turbovec import IdMapIndex
from supabase import create_client, Client
from dotenv import load_dotenv
import numpy as np

# Load environment variables from the parent .env.local file
load_dotenv("../../.env.local")

# Initialize FastAPI app
app = FastAPI(title="Libro Vector Service")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
MODEL_NAME = "nomic-ai/nomic-embed-text-v1.5"
INDEX_FILE = "libro_index.tvim"
BUCKET_NAME = "libro-vectors"
DIMENSIONS = 768

# Global state
model = None
index = None
supabase: Client = None

@app.on_event("startup")
async def startup_event():
    global model, index, supabase
    
    logger.info(f"Loading embedding model: {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME, trust_remote_code=True)
    logger.info("Model loaded successfully.")

    url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        logger.warning("Supabase credentials not found in env. Running completely locally.")
    else:
        logger.info("Initializing Supabase client...")
        supabase = create_client(url, key)
        
        # Try to download the existing index
        try:
            res = supabase.storage.from_(BUCKET_NAME).download(INDEX_FILE)
            with open(INDEX_FILE, "wb") as f:
                f.write(res)
            logger.info("Successfully downloaded index from Supabase.")
        except Exception as e:
            logger.warning(f"Could not download index from Supabase: {e}. Starting fresh.")
    
    if os.path.exists(INDEX_FILE):
        try:
            logger.info("Loading IdMapIndex from local file...")
            index = IdMapIndex.load(INDEX_FILE)
        except Exception as e:
            logger.error(f"Failed to load local index: {e}. Starting fresh.")
            index = IdMapIndex(dim=DIMENSIONS, bit_width=4)
    else:
        logger.info("Creating new IdMapIndex...")
        index = IdMapIndex(dim=DIMENSIONS, bit_width=4)

def sync_to_supabase():
    """Background task to sync the index to Supabase Storage"""
    if not supabase:
        return
    try:
        index.write(INDEX_FILE)
        with open(INDEX_FILE, "rb") as f:
            # Overwrite the existing file
            supabase.storage.from_(BUCKET_NAME).upload(
                path=INDEX_FILE, 
                file=f, 
                file_options={"cacheControl": "3600", "upsert": "true"}
            )
        logger.info("Successfully synced index to Supabase.")
    except Exception as e:
        logger.error(f"Error syncing to Supabase: {e}")

class EmbedRequest(BaseModel):
    text: str
    task_type: str = "search_document"

class EmbedResponse(BaseModel):
    embedding: List[float]
    dimensions: int

class AddVectorRequest(BaseModel):
    id: int # turbovec uses uint64
    text: str
    
class SearchVectorRequest(BaseModel):
    query: str
    k: int = 10
    allowlist: Optional[List[int]] = None

@app.post("/embed", response_model=EmbedResponse)
async def embed(req: EmbedRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    try:
        prefix = f"{req.task_type}: "
        embeddings = model.encode([prefix + req.text], normalize_embeddings=True)
        vec = embeddings[0].tolist()
        return EmbedResponse(embedding=vec, dimensions=len(vec))
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/add")
async def add_vector(req: AddVectorRequest, background_tasks: BackgroundTasks):
    try:
        prefix = "search_document: "
        embeddings = model.encode([prefix + req.text], normalize_embeddings=True)
        
        # Turbovec requires numpy arrays
        vec_np = np.array(embeddings, dtype=np.float32)
        id_np = np.array([req.id], dtype=np.uint64)
        
        index.add_with_ids(vec_np, id_np)
        
        # Save and sync in the background so we don't block the API
        index.write(INDEX_FILE)
        background_tasks.add_task(sync_to_supabase)
        
        return {"status": "success", "id": req.id}
    except Exception as e:
        logger.error(f"Error adding vector: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search_vector(req: SearchVectorRequest):
    try:
        prefix = "search_query: "
        embeddings = model.encode([prefix + req.query], normalize_embeddings=True)
        vec_np = np.array(embeddings, dtype=np.float32)
        
        if req.allowlist:
            allow_np = np.array(req.allowlist, dtype=np.uint64)
            scores, ids = index.search(vec_np, k=req.k, allowlist=allow_np)
        else:
            scores, ids = index.search(vec_np, k=req.k)
            
        # Return as python lists
        # ids is a 2D array, we just want the first query's results
        return {
            "ids": ids[0].tolist(),
            "scores": scores[0].tolist()
        }
    except Exception as e:
        logger.error(f"Error searching vectors: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    # Turbovec doesnt expose ntotal directly on the python object cleanly in some versions, 
    # but let's assume it has some size indicator, or we'll just return ok.
    # To be safe, omit index_size if it crashes.
    return {"status": "ok", "model": MODEL_NAME, "dimensions": DIMENSIONS}
