import { NextRequest, NextResponse } from 'next/server';
import { fetchPCAPassportData } from '@/lib/fetchPCAPassportData';
import { ALL_ACCESSIONS_SUBSET } from '@/config/pca-location-config';
import { getPostHogClient } from '@/lib/posthog-server';

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get('file');
  const subset = request.nextUrl.searchParams.get('subset') ?? ALL_ACCESSIONS_SUBSET;

  if (!file) {
    return NextResponse.json(
      { error: 'Missing required query param: file' },
      { status: 400 },
    );
  }

  try {
    const data = await fetchPCAPassportData(file, subset);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/pca-passport-data:', error);
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: 'server',
      event: 'data_load_failed',
      properties: {
        file,
        subset,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    await posthog.flush();
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
