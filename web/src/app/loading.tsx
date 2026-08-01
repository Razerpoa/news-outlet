export default function Loading() {
  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
      <div className="news-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="sk-card">
            <div className="skeleton sk-media" />
            <div className="skeleton sk-line" />
            <div className="skeleton sk-line short" />
            <div className="skeleton sk-line tiny" />
          </div>
        ))}
      </div>
    </div>
  );
}
