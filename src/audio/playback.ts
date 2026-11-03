const buffers = new Map<string, Promise<AudioBuffer>>();
let context: AudioContext | null = null;
let current: AudioBufferSourceNode | null = null;

function audioContext(): AudioContext {
  context ??= new AudioContext();
  return context;
}

function load(url: string): Promise<AudioBuffer> {
  let pending = buffers.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .then((data) => audioContext().decodeAudioData(data));
    buffers.set(url, pending);
    pending.catch(() => buffers.delete(url));
  }
  return pending;
}

async function playBuffer(buffer: AudioBuffer, startMs = 0, endMs?: number): Promise<void> {
  const ctx = audioContext();
  await ctx.resume();
  stopPlayback();

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  const offset = Math.min(startMs / 1000, buffer.duration);
  const duration = endMs === undefined ? undefined : Math.max(0.01, (endMs - startMs) / 1000);

  current = source;
  source.start(0, offset, duration);
  await new Promise<void>((resolve) => {
    source.onended = () => resolve();
  });
  if (current === source) current = null;
}

export async function playUrl(url: string, startMs = 0, endMs?: number): Promise<void> {
  await playBuffer(await load(url), startMs, endMs);
}

export async function playSamples(samples: Float32Array, sampleRate: number): Promise<void> {
  if (samples.length === 0) return;
  const buffer = audioContext().createBuffer(1, samples.length, sampleRate);
  buffer.copyToChannel(new Float32Array(samples), 0);
  await playBuffer(buffer);
}

export function stopPlayback(): void {
  if (!current) return;
  current.onended = null;
  current.stop();
  current.disconnect();
  current = null;
}
