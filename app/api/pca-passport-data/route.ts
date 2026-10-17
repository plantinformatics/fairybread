import { NextRequest, NextResponse } from 'next/server';
import { fetchPCAPassportData } from '@/lib/fetchPCAPassportData';
import { ALL_ACCESSIONS_SUBSET } from '@/config/pca-location-config';
import { getPostHogClient } from '@/lib/posthog-server';
import { BODY_BYTES_HEADER } from '@/lib/read-json-with-progress';

// Data changes rarely and day-old data is fine. Browsers reuse a response for an hour,
// the CDN for a day, then keeps serving the stale copy for up to a week while it
// revalidates in the background. Only successful responses are cached.
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';

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
    const result = await fetchPCAPassportData(file, subset);
    const body = new TextEncoder().encode(JSON.stringify(result));
    return new Response(body, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': CACHE_CONTROL,
        [BODY_BYTES_HEADER]: String(body.byteLength),
      },
    });
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
