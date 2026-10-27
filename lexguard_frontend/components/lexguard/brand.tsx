import { Scale } from "lucide-react";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={"brand" + (light ? " brand-light" : "")}>
      <span className="brand-symbol">
        <Scale size={21} strokeWidth={1.65} aria-hidden="true" />
      </span>
      <span>
        lexguard<span className="brand-period">.</span>
      </span>
    </span>
  );
}
