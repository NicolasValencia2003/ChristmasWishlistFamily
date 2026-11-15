const COLORS = ['red', 'gold', 'green', 'blue'] as const;

/** A string of twinkling Christmas lights (decorative only). */
export function Lights() {
  return (
    <div className="lights" aria-hidden="true">
      {Array.from({ length: 30 }, (_, i) => (
        <span
          key={i}
          className={`bulb bulb--${COLORS[i % COLORS.length]}`}
          style={{ animationDelay: `${((i * 0.53) % 2.4).toFixed(2)}s` }}
        />
      ))}
    </div>
  );
}
