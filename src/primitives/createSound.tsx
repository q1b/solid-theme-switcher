import { createSignal, createMemo, onCleanup, createRoot, createEffect } from "solid-js";
import type {Howl} from 'howler';

export type SpriteMap = {
  [key: string]: [number, number];
};

export type HookOptions<T = any> = T & {
  id?: string;
  volume?: number;
  playbackRate?: number;
  interrupt?: boolean;
  soundEnabled?: boolean;
  sprite?: SpriteMap;
  onload?: () => void;
};

export interface PlayOptions {
  id?: string;
  forceSoundEnabled?: boolean;
  playbackRate?: number;
}

export type PlayFunction = (options?: PlayOptions) => void;

export interface ExposedData {
  sound: Howl | null;
  stop: (id?: string) => void;
  pause: (id?: string) => void;
  duration: number | null;
}

export type ReturnedValue = [PlayFunction, ExposedData];

export function createSound<T = any>(
  src: string | string[],
  {
    id,
    volume = 1,
    playbackRate = 1,
    soundEnabled = true,
    interrupt = false,
    onload,
    ...delegated
  }: HookOptions<T> = {} as HookOptions
) {
  const [HowlConstructor,setHowlConstructor]= createSignal<Howl|null>(null);
  const [isMounted,setIsMounted] = createSignal(false);
  const [duration, setDuration] = createSignal<number | null>(null);
  const [sound, setSound] = createSignal<Howl | null>(null);
  
  const handleLoad = function() {
    if (typeof onload === 'function') {
      // @ts-ignore
      onload.call(this);
    }
    if (isMounted()) {
      // @ts-ignore
      setDuration(this.duration() * 1000);
    }
    // @ts-ignore
    setSound(this);
  };

  // We want to lazy-load Howler, since sounds can't play on load anyway.
  createEffect(() => {
    import('howler').then(mod => {
      if (!isMounted) {
        setHowlConstructor(mod.Howl ?? new mod.default.Howl);
        new HowlConstructor()({
            src: Array.isArray(src) ? src : [src],
            volume,
            rate: playbackRate,
            onload: handleLoad,
            ...delegated, 
        });
        setIsMounted(true)
      }
    });
    onCleanup(() => {setIsMounted(false)})
  });

  
  // Whenever volume/playbackRate are changed, change those properties
  // on the sound instance.
  createEffect(() => {
    if (sound) {
      sound()?.volume(volume);
      sound()?.rate(playbackRate);
    }
  });
  createEffect(() => {
    if (HowlConstructor && sound()) {
      setSound(
        new HowlConstructor({
          src: Array.isArray(src) ? src : [src],
          volume,
          onload: handleLoad,
          ...delegated,
        })
      );
    }
  });

  const play: PlayFunction =  (options?: PlayOptions) => {
      if (typeof options === 'undefined') {
        options = {};
      }
      if (!sound || (!soundEnabled && !options.forceSoundEnabled)) {
        return;
      }
      if (interrupt) {
        sound()?.stop();
      }
      if (options.playbackRate) {
        sound()?.rate(options.playbackRate);
      }
      sound()?.play(options.id);
    };

  const stop = (id: any) => {
      if (!sound) {
        return;
      }
      sound?.stop(id);
    };

  const pause = (id:any) => {
      if (!sound) {
        return;
      }
      sound()?.pause(id);
    };

  const returnedValue: ReturnedValue = [
    play,
    {
      sound,
      stop,
      pause,
      duration,
    },
  ];

  return returnedValue;
}

// export default createRoot(createSound);
