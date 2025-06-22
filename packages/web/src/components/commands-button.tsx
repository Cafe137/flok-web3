import { cn, isMobilePhone } from "@/lib/utils";
import { Command } from "lucide-react";
import { Button, ButtonProps } from "./ui/button";
import { useMemo } from "react";

export const CommandsButton = (props: ButtonProps) => {
  const isMobile = useMemo(() => isMobilePhone(), []);

  return (
    <Button
      variant={isMobile ? "outline" : "ghost"}
      className={cn(
        "ml-2 px-2 bg-slate-900 bg-opacity-70 h-5 w-5 p-1",
        props.className,
      )}
      {...props}
    >
      <Command />
    </Button>
  );
};
