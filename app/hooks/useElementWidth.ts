import { useEffect, useRef, useState, type RefObject } from 'react';

/** Tracks an element's content width so SVGs can be drawn at real pixel size. */
export function useElementWidth(
  initialWidth: number
): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(initialWidth);

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
