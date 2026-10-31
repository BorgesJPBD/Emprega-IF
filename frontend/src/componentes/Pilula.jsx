export default function Pilula({ ativa, conta, onClick, children }) {
  return (
    <button type="button" className="pilula" aria-pressed={ativa} onClick={onClick}>
      {children}
      {conta !== undefined && <span className="pilula__conta">{conta}</span>}
    </button>
  );
}

export function GrupoPilulas({ titulo, children, className = "" }) {
  return (
    <div role="group" aria-label={titulo} className={`min-w-0 ${className}`}>
      <p className="mb-2 text-[15px] font-semibold text-floresta">{titulo}</p>
      <div className="trilho">{children}</div>
    </div>
  );
}
