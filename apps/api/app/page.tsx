export default function HomePage() {
  return (
    <main style={{ padding: 40, lineHeight: 1.6 }}>
      <h1 style={{ margin: 0, fontWeight: 600 }}>Firstmom API</h1>
      <p style={{ color: '#5C5141' }}>
        Backend is up. Try <code>GET /api/health</code>.
      </p>
    </main>
  );
}
