/**
 * Shared configuration constants.
 *
 * Centralised here so the upload limit and accepted formats are defined once
 * and stay consistent across the API route, the Loom service and the UI.
 */

/** Max upload size accepted by the transcription providers (Whisper limit). */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** Same limit expressed in megabytes, for UI copy. */
export const MAX_UPLOAD_MB = 25;

/** Audio / video file extensions accepted by the upload form. */
export const ACCEPTED_AUDIO_EXTENSIONS = [
  ".mp3",
  ".mp4",
  ".mpeg",
  ".mpga",
  ".m4a",
  ".wav",
  ".webm",
] as const;

/** Comma-joined accept attribute for the file <input>. */
export const ACCEPT_ATTRIBUTE = ACCEPTED_AUDIO_EXTENSIONS.join(",");

/** How many meetings the history page / list API returns. */
export const MEETING_HISTORY_LIMIT = 50;
