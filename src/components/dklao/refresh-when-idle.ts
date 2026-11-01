// Images and fonts settle after load and move content, so the motion components re-measure their scroll
// triggers when the page changes size. ScrollTrigger.refresh() jumps to the top and back to measure, which
// cancels a smooth scroll in progress (a "Read more" link left its section 387px short), so the refresh
// waits until the page has not scrolled for `delay` ms. Returns the cleanup.
export function refreshWhenIdle(refresh: () => void, delay = 150): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastScroll = -Infinity;

  const attempt = () => {
    const quietFor = Date.now() - lastScroll;
    timer = quietFor >= delay ? (refresh(), undefined) : setTimeout(attempt, delay - quietFor);
  };
  const onScroll = () => {
    lastScroll = Date.now();
  };
  const observer = new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(attempt, delay);
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  observer.observe(document.body);

  return () => {
    clearTimeout(timer);
    observer.disconnect();
    window.removeEventListener("scroll", onScroll);
  };
}
