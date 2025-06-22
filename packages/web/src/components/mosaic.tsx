import { cn, isMobilePhone } from "@/lib/utils";
import { ReactNode, cloneElement, useMemo } from "react";

interface MosaicProps {
  className: string;
  items: ReactNode[];
  currentPaneIndex?: number;
}

export function Mosaic({
  className,
  items,
  currentPaneIndex = 0,
}: MosaicProps) {
  const isSinglePaneLayout = useMemo(() => isMobilePhone(), []);

  const getGridClasses = (itemCount: number) => {
    // Use single column layout only for mobile devices
    if (isSinglePaneLayout) {
      return `grid-cols-1 grid-rows-${itemCount} md:grid-cols-1 md:grid-rows-${itemCount}`;
    }

    // Desktop and tablet grid layouts
    switch (itemCount) {
      case 0:
        return "grid-cols-1 grid-rows-1";
      case 1:
        return "grid-cols-1 grid-rows-1";
      case 2:
        return "grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1";
      case 3:
        return "grid-cols-1 grid-rows-3 md:grid-cols-2 md:grid-rows-2 md:[&>:nth-child(3)]:col-span-2";
      case 4:
        return "grid-cols-1 grid-rows-4 md:grid-cols-2 md:grid-rows-2";
      case 5:
        return "grid-cols-1 grid-rows-5 md:grid-cols-6 md:grid-rows-2 md:[&>:nth-child(1)]:col-span-2 md:[&>:nth-child(2)]:col-span-2 md:[&>:nth-child(3)]:col-span-2 md:[&>:nth-child(4)]:col-span-3 md:[&>:nth-child(5)]:col-span-3";
      case 6:
        return "grid-cols-1 grid-rows-6 md:grid-cols-3 md:grid-rows-2";
      case 7:
        return "grid-cols-1 grid-rows-7 md:grid-cols-12 md:grid-rows-2 md:[&>:nth-child(1)]:col-span-3 md:[&>:nth-child(2)]:col-span-3 md:[&>:nth-child(3)]:col-span-3 md:[&>:nth-child(4)]:col-span-3 md:[&>:nth-child(5)]:col-span-4 md:[&>:nth-child(6)]:col-span-4 md:[&>:nth-child(7)]:col-span-4";
      case 8:
      default:
        if (itemCount > 8) {
          console.warn("More than 8 slots are not supported right now");
        }
        return "grid-cols-1 grid-rows-8 md:grid-cols-4 md:grid-rows-2";
    }
  };

  const gridClasses = getGridClasses(items.length);

  return (
    <div className="relative">
      <div
        className={cn(
          "grid gap-1 p-1 h-screen overflow-hidden",
          isSinglePaneLayout
            ? "overflow-y-auto md:overflow-y-auto"
            : "overflow-y-auto md:overflow-y-hidden",
          gridClasses,
          className,
        )}
      >
        {items.map((item: any, index: number) => {
          return (
            <div
              key={index}
              className={cn(
                "bg-transparent min-h-0 min-w-0 overflow-hidden",
                isSinglePaneLayout
                  ? "h-screen md:h-screen"
                  : "h-screen md:h-auto",
                isSinglePaneLayout && index !== currentPaneIndex && "hidden",
              )}
            >
              {cloneElement(item, {
                halfHeight: false,
                isSinglePaneLayout,
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
