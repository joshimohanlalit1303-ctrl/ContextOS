FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download model at build time to prevent cold starts on deployment
# This will run the cache_model.py script to download nomic-embed-text-v1.5
COPY cache_model.py .
RUN python cache_model.py

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 8000

# Run the FastAPI app with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
