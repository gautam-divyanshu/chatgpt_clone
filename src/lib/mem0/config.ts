export const createMem0Client = () => {
  const apiKey = process.env.MEM0_API_KEY;
  
  if (!apiKey) {
    console.warn('MEM0_API_KEY not found. Memory features will be disabled.');
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const MemoryClient = require('mem0ai').default || require('mem0ai');
    const client = new MemoryClient({ apiKey });
    return client;
  } catch (error) {
    console.error('Failed to initialize Mem0 client:', error);
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mem0Module = require('mem0ai');
      const MemoryClient = mem0Module.default || mem0Module.MemoryClient || mem0Module;
      
      if (MemoryClient) {
        const client = new MemoryClient({ apiKey });
        return client;
      }
    } catch (altError) {
      console.error('Alternative initialization also failed:', altError);
    }
    
    return null;
  }
};

export interface ChatMemory {
  id: string;
  userId: string;
  conversationId: string;
  memory: string;
  metadata?: {
    timestamp: string;
    messageId?: string;
    category?: 'preference' | 'fact' | 'context' | 'instruction';
    importance?: 'high' | 'medium' | 'low';
  };
}

export const MEMORY_CONFIG = {
  IMPORTANCE_THRESHOLD: 0.6,
  CATEGORIES: {
    PREFERENCE: 'preference',
    FACT: 'fact', 
    CONTEXT: 'context',
    INSTRUCTION: 'instruction'
  },
  MAX_MEMORIES_PER_CONVERSATION: 50,
  RETENTION_DAYS: 30
} as const;
