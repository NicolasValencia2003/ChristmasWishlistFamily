const FLAKES = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: -((i * 7) % 16),
  duration: 11 + ((i * 5) % 10),
  size: 0.55 + ((i * 3) % 6) / 10,
}));

/** Decorative falling snow (hidden from screen readers, off with reduced motion). */
export function Snow() {
  return (
    <div className="snow" aria-hidden="true">
      {FLAKES.map((f, i) => (
        <span
          key={i}
          className="snow__flake"
          style={{
            left: `${f.left}%`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            fontSize: `${f.size}rem`,
          }}
        >
          ❄
        </span>
      ))}
    </div>
  );
}
