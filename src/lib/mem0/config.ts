// Mem0 client configuration
export const createMem0Client = () => {
  const apiKey = process.env.MEM0_API_KEY;
  
  if (!apiKey) {
    console.warn('MEM0_API_KEY not found. Memory features will be disabled.');
    return null;
  }

  try {
    // Import using the correct format from mem0ai documentation
    const MemoryClient = require('mem0ai').default || require('mem0ai');
    
    // Initialize with the correct format: new MemoryClient({ apiKey: key })
    const client = new MemoryClient({ apiKey });
    console.log('Mem0 client created successfully');
    return client;
    
  } catch (error) {
    console.error('Failed to initialize Mem0 client:', error);
    
    // Try alternative import methods
    try {
      const mem0Module = require('mem0ai');
      
      // Try different export patterns
      const MemoryClient = mem0Module.default || mem0Module.MemoryClient || mem0Module;
      
      if (MemoryClient) {
        const client = new MemoryClient({ apiKey });
        console.log('Mem0 client created with alternative method');
        return client;
      }
      
    } catch (altError) {
      console.error('Alternative initialization also failed:', altError);
    }
    
    return null;
  }
};

// Memory types for our application
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

// Configuration for memory extraction
export const MEMORY_CONFIG = {
  // Threshold for memory importance (0-1)
  IMPORTANCE_THRESHOLD: 0.6,
  
  // Categories for automatic memory classification
  CATEGORIES: {
    PREFERENCE: 'preference',
    FACT: 'fact', 
    CONTEXT: 'context',
    INSTRUCTION: 'instruction'
  },
  
  // Maximum memories to store per conversation
  MAX_MEMORIES_PER_CONVERSATION: 50,
  
  // Memory retention duration (in days)
  RETENTION_DAYS: 30
} as const;
