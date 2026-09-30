export function LegalSection({ title, children }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-content">{title}</h2>
      <div className="space-y-2 leading-7 text-muted">{children}</div>
    </div>
  );
}
