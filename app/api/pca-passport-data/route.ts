import { NextRequest, NextResponse } from 'next/server';
import { fetchPCAPassportData } from '@/lib/fetchPCAPassportData';
import { ALL_ACCESSIONS_SUBSET } from '@/config/pca-location-config';
import { getPostHogClient } from '@/lib/posthog-server';
import type { PcaDataStreamEvent } from '@/lib/load-progress';

/**
 * Streams NDJSON: `progress` events while loading, then one `result` or `error`.
 * Errors after the stream opens can't change the HTTP status, so they're sent as an event.
 */
export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get('file');
  const subset = request.nextUrl.searchParams.get('subset') ?? ALL_ACCESSIONS_SUBSET;
  // ?nocache=1 bypasses every server cache layer so load times can be measured cold
  const noCache = ['1', 'true'].includes(request.nextUrl.searchParams.get('nocache') ?? '');

  if (!file) {
    return NextResponse.json(
      { error: 'Missing required query param: file' },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: PcaDataStreamEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      };

      try {
        const result = await fetchPCAPassportData(file, subset, {
          noCache,
          onProgress: (progress) => send({ type: 'progress', progress }),
        });
        const resultLine = encoder.encode(JSON.stringify({ type: 'result', ...result } satisfies PcaDataStreamEvent) + '\n');
        send({ type: 'progress', progress: { stage: 'downloading', receivedBytes: 0, totalBytes: resultLine.byteLength } });
        controller.enqueue(resultLine);
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
        send({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
        await posthog.flush();
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      // no-transform stops response compression from buffering progress events
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
