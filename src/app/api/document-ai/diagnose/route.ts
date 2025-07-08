import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/config';

export async function GET(_request: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    // Test 1: Environment variables
    const envTest = {
      projectId: !!ENV.GOOGLE_CLOUD_PROJECT_ID,
      location: !!ENV.GOOGLE_CLOUD_LOCATION,
      processorId: !!ENV.GOOGLE_CLOUD_PROCESSOR_ID,
      credentials: !!ENV.GOOGLE_APPLICATION_CREDENTIALS,
      values: {
        projectId: ENV.GOOGLE_CLOUD_PROJECT_ID,
        location: ENV.GOOGLE_CLOUD_LOCATION,
        processorId: ENV.GOOGLE_CLOUD_PROCESSOR_ID,
        credentials: ENV.GOOGLE_APPLICATION_CREDENTIALS,
      }
    };

    // Test 2: Google Cloud Document AI client initialization
    let clientTest: { success: boolean; error: string | null; processorName?: string } = { success: false, error: null };
    try {
      const { DocumentProcessorServiceClient } = await import('@google-cloud/documentai');
      
      new DocumentProcessorServiceClient({
        keyFilename: ENV.GOOGLE_APPLICATION_CREDENTIALS,
      });
      
      // Test if we can create the processor name
      const processorName = `projects/${ENV.GOOGLE_CLOUD_PROJECT_ID}/locations/${ENV.GOOGLE_CLOUD_LOCATION}/processors/${ENV.GOOGLE_CLOUD_PROCESSOR_ID}`;
      
      clientTest = { 
        success: true, 
        error: null,
        processorName,
      };
    } catch (error) {
      clientTest = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 3: File system access (if using local credentials file)
    let fileSystemTest: { success: boolean; error: string | null } = { success: false, error: null };
    if (ENV.GOOGLE_APPLICATION_CREDENTIALS && ENV.GOOGLE_APPLICATION_CREDENTIALS.startsWith('./')) {
      try {
        const fs = await import('fs/promises');
        await fs.access(ENV.GOOGLE_APPLICATION_CREDENTIALS);
        fileSystemTest = { success: true, error: null };
      } catch (error) {
        fileSystemTest = { 
          success: false, 
          error: error instanceof Error ? error.message : 'File not found'
        };
      }
    } else {
      fileSystemTest = { 
        success: true, 
        error: 'Using environment variable or other auth method'
      };
    }

    const overall = envTest.projectId && envTest.processorId && envTest.credentials && clientTest.success;

    return NextResponse.json({
      success: overall,
      tests: {
        environment: envTest,
        client: clientTest,
        fileSystem: fileSystemTest,
      },
      recommendations: overall ? [] : [
        !envTest.projectId && 'Set GOOGLE_CLOUD_PROJECT_ID in .env.local',
        !envTest.processorId && 'Set GOOGLE_CLOUD_PROCESSOR_ID in .env.local',
        !envTest.credentials && 'Set GOOGLE_APPLICATION_CREDENTIALS in .env.local',
        !clientTest.success && 'Check Google Cloud credentials and dependencies',
        !fileSystemTest.success && ENV.GOOGLE_APPLICATION_CREDENTIALS?.startsWith('./') && 'Check if credentials file exists at specified path',
      ].filter(Boolean),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Diagnostic test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run diagnostic tests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
