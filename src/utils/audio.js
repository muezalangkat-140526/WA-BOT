import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

/**
 * Mengonversi buffer audio (MP3, WAV, AAC, dsb.) ke format OGG Opus (standar WhatsApp PTT Voice Note)
 * @param {Buffer} buffer - Buffer audio input
 * @returns {Promise<Buffer>} - Buffer audio OGG Opus
 */
export async function convertToOpus(buffer) {
  if (!ffmpeg?.path) {
    throw new Error('Binary FFmpeg tidak ditemukan.');
  }

  const id = Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const tmpIn = path.join(os.tmpdir(), `in_${id}.tmp`);
  const tmpOut = path.join(os.tmpdir(), `out_${id}.ogg`);

  fs.writeFileSync(tmpIn, buffer);

  return new Promise((resolve, reject) => {
    // Parameter standar WhatsApp PTT Voice Note:
    // Codec: libopus, bit rate: 32k, VBR: on, channel: 1 (mono), sample rate: 48000Hz
    execFile(
      ffmpeg.path,
      ['-y', '-i', tmpIn, '-vn', '-c:a', 'libopus', '-b:a', '32k', '-vbr', 'on', '-ac', '1', '-ar', '48000', tmpOut],
      (err) => {
        try {
          if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
        } catch {}

        if (err) {
          try {
            if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
          } catch {}
          return reject(err);
        }

        try {
          const outBuf = fs.readFileSync(tmpOut);
          fs.unlinkSync(tmpOut);
          resolve(outBuf);
        } catch (readErr) {
          reject(readErr);
        }
      }
    );
  });
}
