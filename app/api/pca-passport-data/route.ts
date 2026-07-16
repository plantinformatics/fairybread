import { NextRequest, NextResponse } from 'next/server';
import { fetchPCAPassportData } from '@/lib/fetchPCAPassportData';
import { ORIGINAL_SUBSET } from '@/config/pca-location-config';

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get('file');
  const subset = request.nextUrl.searchParams.get('subset') ?? ORIGINAL_SUBSET;

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
