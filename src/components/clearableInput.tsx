import * as React from "react";
import { XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ClearableInputProps = React.ComponentProps<typeof Input> & {
  onClear?: () => void;
};

const ClearableInput = React.forwardRef<HTMLInputElement, ClearableInputProps>(
  ({ className, value, onChange, onClear, type = "search", ...props }, ref) => {
    const hasValue = String(value ?? "").length > 0;

    function handleClear() {
      if (onClear) {
        onClear();
        return;
      }

      onChange?.({
        target: { value: "" },
        currentTarget: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          {...props}
          type={type}
          value={value}
          onChange={onChange}
          className={cn("pr-9 [&::-webkit-search-cancel-button]:hidden", className)}
        />
        {hasValue ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear input"
            className="absolute top-1/2 right-1 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <XIcon className="size-4" />
          </button>
        ) : null}
      </div>
    );
  }
);

ClearableInput.displayName = "ClearableInput";

export { ClearableInput };
