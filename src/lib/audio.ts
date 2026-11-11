import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import type { AdhanTrack } from '../types';

let active: AudioPlayer | null = null;
let activeToken = 0;

export async function initAudio(): Promise<void> {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  } catch {
    // Audio mode is a nicety; playback still works without it.
  }
}

export function stopAudio(): void {
  activeToken++;
  if (active) {
    try {
      active.pause();
      active.remove();
    } catch {
      // player may already be released
    }
    active = null;
  }
}

/** Play a bundled require() asset or a { uri } source. Replaces any current playback. */
export function playSource(src: number | { uri: string }, volume = 1): AudioPlayer {
  stopAudio();
  const player = createAudioPlayer(src as never);
  player.volume = volume;
  player.play();
  active = player;
  return player;
}

export function playAdhan(track: AdhanTrack, volume: number): AudioPlayer | null {
  if (track.imported && track.uri) return playSource({ uri: track.uri }, volume);
  return playSource(track.src, volume);
}

export function currentToken(): number {
  return activeToken;
}
