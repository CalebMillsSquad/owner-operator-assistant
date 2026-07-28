"use client";

import type { MouseEvent } from "react";
import { useFormStatus } from "react-dom";

type ConfirmDeleteButtonProps = {
  itemName: string;
  label?: string;
  pendingLabel?: string;
  confirmMessage?: string;
  className?: string;
};

const defaultClassName = "btn-secondary border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

export function ConfirmDeleteButton({
  itemName,
  label = "Delete",
  pendingLabel = "Deleting...",
  confirmMessage,
  className = defaultClassName,
}: ConfirmDeleteButtonProps) {
  const { pending } = useFormStatus();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const message = confirmMessage ?? `Delete ${itemName}? This cannot be undone.`;

    if (!window.confirm(message)) {
      event.preventDefault();
    }
  }

  return (
    <button type="submit" className={className} onClick={handleClick} disabled={pending} aria-label={`Delete ${itemName}`}>
      {pending ? pendingLabel : label}
    </button>
  );
}
