import { MapPin } from "lucide-react";

import { cidadeDe } from "../vagas";

export default function EtiquetaLocal({ local, className = "" }) {
  return (
    <span className={`dado inline-flex min-w-0 items-center gap-1.5 text-floresta ${className}`}>
      <MapPin className="size-3.5 shrink-0 text-acao" aria-hidden="true" />
      <span className="truncate">{cidadeDe(local)}</span>
    </span>
  );
}
