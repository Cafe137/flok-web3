import { Button, ButtonProps } from "./ui/button";
import { cn } from "@/lib/utils";

export const LargeButton = ({ className, children, ...props }: ButtonProps) => (
  <Button
    variant="outline"
    className={cn("px-2 bg-slate-900 bg-opacity-70", className)}
    {...props}
  >
    {children}
  </Button>
);
