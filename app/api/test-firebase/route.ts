import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const hasServiceAccount = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  try {
    if (!hasServiceAccount) {
      return NextResponse.json({
        success: false,
        error: 'FIREBASE_SERVICE_ACCOUNT_KEY not found in environment variables'
      }, { status: 500 });
    }

    // Try to parse the JSON
    const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

    // Check required fields
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !serviceAccountKey[field]);

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Service account key is missing required fields',
        missingFields
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Firebase Service Account is properly configured! ✅',
      config: {
        projectId: serviceAccountKey.project_id,
        clientEmail: serviceAccountKey.client_email,
        hasPrivateKey: !!serviceAccountKey.private_key,
        privateKeyLength: serviceAccountKey.private_key?.length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY',
      details: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Make sure the JSON is properly formatted as a single line with escaped newlines (\\\\n)'
    }, { status: 500 });
  }
}
