/* eslint-disable */

import { pipeline, env } from '@xenova/transformers';

// Skip local cache for edge/serverless compatibility or configure appropriately.
// By default, it will download weights and cache them locally.
// We use a singleton pattern for the pipeline to avoid re-loading the model in memory.
class PipelineSingleton {
    static task = 'feature-extraction';
    static model = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
    static instance: any = null;

    static async getInstance(progress_callback: any = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task as 'feature-extraction', this.model, { progress_callback });
        }
        return this.instance;
    }
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const extractor = await PipelineSingleton.getInstance();
    
    // Generate the embedding
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    
    // Output is a Tensor, we convert to standard array
    return Array.from(output.data);
}
