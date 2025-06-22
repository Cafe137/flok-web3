import { Button, ButtonProps } from "./ui/button";
import { cn, isMobilePhone } from "@/lib/utils";
import { useMemo } from "react";

export const ReplsButton = (props: ButtonProps) => {
  const isMobile = useMemo(() => isMobilePhone(), []);

  return (
    <Button
      variant={isMobile ? "outline" : "ghost"}
      size="sm"
      className={cn("ml-2 bg-opacity-50 bg-black h-5", props.className)}
      {...props}
    >
      <span className="text-xs">REPLs</span>
    </Button>
  );
};
