import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogProps } from "@radix-ui/react-dialog";
import { useState, FormEvent, useEffect } from "react";

interface ImportSwarmDialogProps extends DialogProps {
  onAccept?: (input: string) => void;
}

export function ImportSwarmDialog({
  onAccept,
  ...props
}: ImportSwarmDialogProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (onAccept && trimmed) {
      onAccept(trimmed);
    }
    props.onOpenChange && props.onOpenChange(false);
  };

  useEffect(() => {
    if (!props.open) setValue("");
  }, [props.open]);

  return (
    <Dialog {...props}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Import from Swarm</DialogTitle>
            <DialogDescription>
              Paste a Swarm hash or a bzz.limo URL to load it into the selected
              pane.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="swarm-ref">Swarm hash or URL</Label>
              <Input
                id="swarm-ref"
                value={value}
                placeholder="e.g. https://bzz.limo/bzz/<hash>/"
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Import</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
