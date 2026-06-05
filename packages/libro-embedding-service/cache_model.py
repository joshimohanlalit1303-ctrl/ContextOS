from sentence_transformers import SentenceTransformer

def cache_model():
    print("Downloading nomic-embed-text-v1.5 to Docker image layer...")
    # This downloads the model so it is cached in the Docker image
    SentenceTransformer("nomic-ai/nomic-embed-text-v1.5", trust_remote_code=True)
    print("Model cached successfully!")

if __name__ == "__main__":
    cache_model()
