"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function ConfirmButton({
  message,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  message: string;
  children?: ReactNode;
}) {
  return (
    <button
      {...props}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
