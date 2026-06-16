import { ReactNode } from "react";

interface Props {
  label: string;
  description?: string;
  right: ReactNode;
  danger?: boolean;
}

export function SettingRow({
  label,
  description,
  right,
  danger
}: Props) {
  return (
    <div className="flex items-center justify-between pr-2 py-3">
      <div>
        <p
          className={`text-sm font-medium ${
            danger ? "text-red-400" : "text-white"
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-400">{description}</p>
        )}
      </div>

      <div>{right}</div>
    </div>
  );
}