import { pipeline } from '@xenova/transformers';

class PipelineSingleton {
    static task = 'feature-extraction';
    static model = 'Xenova/all-MiniLM-L6-v2';
    static instance: any = null;

    static async getInstance(progress_callback: any = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const extractor = await PipelineSingleton.getInstance();
    
    // Generate embeddings
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    
    // Convert Float32Array to standard array
    return Array.from(output.data);
}
