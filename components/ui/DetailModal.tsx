import { X } from "lucide-react";
import { useEffect } from "react";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any> | null;
}

export function DetailModal({ isOpen, onClose, title, data }: DetailModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4" onClick={onClose}>
      <div className="bg-background w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
            {Object.entries(data).map(([key, value]) => {
              // Ignore empty values or complex nested objects that aren't formatted
              if (value === null || value === undefined || (typeof value === "object" && !Array.isArray(value))) return null;

              const formattedKey = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());
              
              const displayValue = Array.isArray(value)
                ? value.join(", ")
                : typeof value === "boolean"
                ? value ? "Yes" : "No"
                : String(value);

              if (!displayValue) return null;

              return (
                <div key={key} className="col-span-1 sm:col-span-2">
                  <dt className="text-[13px] font-medium text-muted-foreground">{formattedKey}</dt>
                  <dd className="mt-1 text-[15px] font-medium text-foreground whitespace-pre-wrap">
                    {displayValue}
                  </dd>
                </div>
              );
            })}
          </div>
        </div>
        <div className="border-t border-border/50 bg-muted/20 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
