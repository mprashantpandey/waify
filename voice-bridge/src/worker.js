import 'dotenv/config';
import { spawn } from 'node:child_process';

let wrtc = null;
try {
  wrtc = await import('@roamhq/wrtc');
  wrtc = wrtc.default || wrtc;
} catch (error) {
  console.error('Native WebRTC runtime is unavailable on this server:', error.message);
}

const baseUrl = (process.env.ZYPTOS_BASE_URL || 'https://zyptos.com').replace(/\/$/, '');
const secret = process.env.VOICE_BRIDGE_SECRET || '';
const workerId = process.env.VOICE_BRIDGE_WORKER_ID || `voice-worker-${process.pid}`;
const pollIntervalMs = Number(process.env.POLL_INTERVAL_MS || 3000);
const utteranceMs = Number(process.env.UTTERANCE_MS || 3600);
const silenceRms = Number(process.env.SILENCE_RMS || 450);
const maxBufferedFrames = Number(process.env.MAX_BUFFERED_FRAMES || 520);

if (!secret) {
  console.error('VOICE_BRIDGE_SECRET is required.');
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function api(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    'X-Voice-Bridge-Secret': secret,
    ...(options.headers || {}),
  };

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }
  return data;
}

async function claimSession() {
  const data = await api('/api/voice-bridge/sessions/claim', {
    method: 'POST',
    body: JSON.stringify({ worker_id: workerId }),
  });
  return data.session || null;
}

async function pollSession(sessionId) {
  const data = await api(`/api/voice-bridge/sessions/${sessionId}?worker_id=${encodeURIComponent(workerId)}`);
  return data.session;
}

async function finishSession(sessionId, status = 'completed', error = null) {
  await api(`/api/voice-bridge/sessions/${sessionId}/finish`, {
    method: 'POST',
    body: JSON.stringify({ worker_id: workerId, status, error }),
  });
}

async function connectWhatsApp(session, offerSdp) {
  const data = await api(`/api/voice-bridge/sessions/${session.id}/connect`, {
    method: 'POST',
    body: JSON.stringify({ worker_id: workerId, sdp: offerSdp }),
  });
  return data.session;
}

async function acceptWhatsApp(session, answerSdp) {
  const data = await api(`/api/voice-bridge/sessions/${session.id}/accept`, {
    method: 'POST',
    body: JSON.stringify({ worker_id: workerId, sdp: answerSdp }),
  });
  return data.session;
}

async function transcript(sessionId, speaker, text) {
  await api(`/api/voice-bridge/sessions/${sessionId}/transcript`, {
    method: 'POST',
    body: JSON.stringify({ worker_id: workerId, speaker, text }),
  });
}

async function agentReply(sessionId, customerText) {
  const data = await api(`/api/voice-bridge/sessions/${sessionId}/agent-reply`, {
    method: 'POST',
    body: JSON.stringify({ worker_id: workerId, customer_text: customerText }),
  });
  return data.reply || '';
}

async function synthesize(sessionId, text) {
  const data = await api(`/api/voice-bridge/sessions/${sessionId}/synthesize`, {
    method: 'POST',
    body: JSON.stringify({ worker_id: workerId, text }),
  });
  return data;
}

async function transcribeAudio(sessionId, audioBuffer) {
  const form = new FormData();
  form.append('worker_id', workerId);
  form.append('audio', new Blob([audioBuffer], { type: 'audio/wav' }), `voice-session-${sessionId}-${Date.now()}.wav`);

  const data = await api(`/api/voice-bridge/sessions/${sessionId}/transcribe`, {
    method: 'POST',
    body: form,
    headers: {},
  });

  return (data.text || '').trim();
}

function samplesToInt16(samples) {
  if (samples instanceof Int16Array) return samples;
  if (samples instanceof ArrayBuffer) return new Int16Array(samples);
  if (ArrayBuffer.isView(samples)) {
    return new Int16Array(samples.buffer, samples.byteOffset, Math.floor(samples.byteLength / 2));
  }
  return new Int16Array(0);
}

function rms(samples) {
  if (!samples.length) return 0;
  let sum = 0;
  for (const sample of samples) {
    sum += sample * sample;
  }
  return Math.sqrt(sum / samples.length);
}

function pcmToWav(samples, sampleRate = 48000) {
  const pcm = samplesToInt16(samples);
  const dataSize = pcm.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  Buffer.from(pcm.buffer, pcm.byteOffset, dataSize).copy(buffer, 44);

  return buffer;
}

function normalizeAudioUrl(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

function normalizeRemoteSdp(sdp) {
  const normalized = String(sdp || '').replace(/\r?\n/g, '\r\n').trimEnd();

  return normalized ? `${normalized}\r\n` : '';
}

async function playAudioUrl(audioSource, url) {
  const audioUrl = normalizeAudioUrl(url);
  if (!audioUrl) return;

  const response = await fetch(audioUrl);
  if (!response.ok) {
    throw new Error(`Unable to fetch synthesized audio: HTTP ${response.status}`);
  }

  const input = Buffer.from(await response.arrayBuffer());
  const ffmpeg = spawn('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    'pipe:0',
    '-f',
    's16le',
    '-acodec',
    'pcm_s16le',
    '-ac',
    '1',
    '-ar',
    '48000',
    'pipe:1',
  ]);

  const chunks = [];
  let stderr = '';

  ffmpeg.stdout.on('data', (chunk) => chunks.push(chunk));
  ffmpeg.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  ffmpeg.stdin.end(input);

  const code = await new Promise((resolve, reject) => {
    ffmpeg.on('error', reject);
    ffmpeg.on('close', resolve);
  });

  if (code !== 0) {
    throw new Error(`ffmpeg decode failed: ${stderr || `exit ${code}`}`);
  }

  const pcm = Buffer.concat(chunks);
  const frameBytes = 480 * 2;
  for (let offset = 0; offset + frameBytes <= pcm.length; offset += frameBytes) {
    const frame = pcm.subarray(offset, offset + frameBytes);
    const samples = new Int16Array(480);
    for (let index = 0; index < 480; index += 1) {
      samples[index] = frame.readInt16LE(index * 2);
    }
    audioSource.onData({
      samples,
      sampleRate: 48000,
      bitsPerSample: 16,
      channelCount: 1,
      numberOfFrames: 480,
    });
    await sleep(10);
  }
}

async function speak(sessionId, audioSource, text) {
  const cleaned = (text || '').trim();
  if (!cleaned) return;
  await transcript(sessionId, 'agent', cleaned);
  try {
    const audio = await synthesize(sessionId, cleaned);
    await playAudioUrl(audioSource, audio.url || audio.audio_url || audio.path);
  } catch (error) {
    await transcript(sessionId, 'system', `TTS failed: ${error.message}`);
    console.error(`Voice session ${sessionId} TTS failed`, error.message);
  }
}

function createPeer(session, audioSource, onUtterance) {
  if (!wrtc) {
    throw new Error('Native WebRTC runtime is unavailable. Run this worker on a host with compatible GLIBC/WebRTC support.');
  }

  const peer = new wrtc.RTCPeerConnection();
  const outboundTrack = audioSource.createTrack();
  peer.addTrack(outboundTrack);

  peer.ontrack = (event) => {
    console.log('Remote WhatsApp audio track received', {
      streams: event.streams?.length || 0,
      track: event.track?.kind,
    });

    if (event.track?.kind !== 'audio' || !wrtc.nonstandard?.RTCAudioSink) return;

    const sink = new wrtc.nonstandard.RTCAudioSink(event.track);
    let frames = [];
    let voicedFrames = 0;
    let lastFlushAt = Date.now();

    sink.ondata = ({ samples, sampleRate }) => {
      const pcm = samplesToInt16(samples);
      if (!pcm.length) return;

      frames.push(new Int16Array(pcm));
      if (rms(pcm) >= silenceRms) voicedFrames += 1;

      const elapsed = Date.now() - lastFlushAt;
      if (elapsed >= utteranceMs || frames.length >= maxBufferedFrames) {
        const captured = frames;
        const hadVoice = voicedFrames >= 8;
        frames = [];
        voicedFrames = 0;
        lastFlushAt = Date.now();

        if (hadVoice) {
          const totalLength = captured.reduce((sum, frame) => sum + frame.length, 0);
          const combined = new Int16Array(totalLength);
          let offset = 0;
          captured.forEach((frame) => {
            combined.set(frame, offset);
            offset += frame.length;
          });
          onUtterance(pcmToWav(combined, sampleRate || 48000)).catch((error) => {
            console.error(`Voice session ${session.id} utterance handling failed`, error.message);
          });
        }
      }
    };

    event.track.addEventListener?.('ended', () => sink.stop());
  };

  return { peer, audioSource, outboundTrack };
}

async function handleSession(session) {
  console.log(`Claimed voice session ${session.id} for ${session.call?.phone_number || 'unknown'}`);
  const audioSource = new wrtc.nonstandard.RTCAudioSource();
  let processing = false;
  let speaking = false;
  let lastCustomerText = '';

  const handleUtterance = async (audioBuffer) => {
    if (processing || speaking) return;
    processing = true;
    try {
      const text = await transcribeAudio(session.id, audioBuffer);
      if (!text || text === lastCustomerText) return;
      lastCustomerText = text;
      console.log(`Voice session ${session.id} customer: ${text}`);
      const reply = await agentReply(session.id, text);
      if (!reply) return;
      console.log(`Voice session ${session.id} agent: ${reply}`);
      speaking = true;
      await speak(session.id, audioSource, reply);
    } finally {
      speaking = false;
      processing = false;
    }
  };

  const { peer, outboundTrack } = createPeer(session, audioSource, handleUtterance);

  try {
    let connected = false;

    if (session.direction === 'inbound') {
      let latest = session;
      for (let attempt = 0; attempt < 15; attempt += 1) {
        if (latest.remote_sdp) break;
        await sleep(1000);
        latest = await pollSession(session.id);
      }

      if (!latest.remote_sdp) {
        throw new Error('Inbound call did not include Meta offer SDP.');
      }

      await peer.setRemoteDescription({ type: 'offer', sdp: normalizeRemoteSdp(latest.remote_sdp) });
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await acceptWhatsApp(session, answer.sdp);
      connected = true;
    } else {
      const offer = await peer.createOffer({ offerToReceiveAudio: true });
      await peer.setLocalDescription(offer);
      await connectWhatsApp(session, offer.sdp);

      for (let attempt = 0; attempt < 30; attempt += 1) {
        const latest = await pollSession(session.id);
        if (latest.remote_sdp) {
          await peer.setRemoteDescription({ type: 'answer', sdp: normalizeRemoteSdp(latest.remote_sdp) });
          connected = true;
          break;
        }
        await sleep(2000);
      }

      if (!connected) {
        throw new Error('Timed out waiting for Meta remote SDP.');
      }
    }

    await transcript(session.id, 'system', 'AI voice bridge connected.');
    const opening = session.agent?.name
      ? `Hello, this is ${session.agent.name} from Zyptos. How can I help you today?`
      : 'Hello, this is Zyptos. How can I help you today?';
    speaking = true;
    await speak(session.id, audioSource, opening);
    speaking = false;

    console.log(`Voice session ${session.id} connected. STT -> agent -> TTS loop is active.`);
    let sessionPollAt = 0;
    while (peer.connectionState !== 'closed' && peer.connectionState !== 'failed') {
      if (['disconnected', 'failed'].includes(peer.connectionState)) break;
      if (Date.now() - sessionPollAt > 2500) {
        sessionPollAt = Date.now();
        const latest = await pollSession(session.id);
        if (['completed', 'failed', 'rejected', 'missed'].includes(latest.status) || ['completed', 'failed', 'rejected', 'missed'].includes(latest.call?.status)) {
          console.log(`Voice session ${session.id} ended by webhook status`, {
            session: latest.status,
            call: latest.call?.status,
          });
          break;
        }
      }
      await sleep(1000);
    }

    outboundTrack.stop();
    peer.close();
    const latest = await pollSession(session.id).catch(() => null);
    if (!latest || !['completed', 'failed'].includes(latest.status)) {
      await finishSession(session.id, 'completed');
    }
  } catch (error) {
    console.error(`Voice session ${session.id} failed`, error);
    outboundTrack.stop();
    peer.close();
    await finishSession(session.id, 'failed', error.message);
  }
}

async function main() {
  console.log(`Zyptos voice bridge worker started as ${workerId}`);
  while (true) {
    try {
      const session = await claimSession();
      if (session) {
        await handleSession(session);
      } else {
        await sleep(pollIntervalMs);
      }
    } catch (error) {
      console.error('Worker loop error', error);
      await sleep(pollIntervalMs);
    }
  }
}

main();
