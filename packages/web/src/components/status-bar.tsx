import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, isMobilePhone } from "@/lib/utils";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  HelpCircle,
  LucideProps,
  Mail,
  RefreshCw,
  Slash,
} from "lucide-react";
import { PropsWithChildren, ReactElement, cloneElement, useMemo } from "react";
import { LargeButton } from "./large-button";

export type PubSubState = "disconnected" | "connected" | "connecting";
export type SyncState = "syncing" | "synced" | "partiallySynced";

interface StateAttributes {
  [state: string]: {
    icon: ReactElement<LucideProps>;
    color: string;
    tooltip?: string;
  };
}

const connectionStates: StateAttributes = {
  disconnected: {
    tooltip: "Disconnected from server",
    color: "red",
    icon: <Slash />,
  },
  connecting: {
    tooltip: "Connecting to server...",
    color: "orange",
    icon: <CircleEllipsis />,
  },
  connected: {
    tooltip: "Connected to server",
    color: "lightgreen",
    icon: <CheckCircle2 />,
  },
};

const syncStates: StateAttributes = {
  syncing: {
    tooltip: "Syncing session...",
    color: "orange",
    icon: <RefreshCw />,
  },
  synced: {
    tooltip: "Session synced",
    color: "lightgreen",
    icon: <Check />,
  },
  partiallySynced: {
    tooltip: "Session synced, but disconnected from server",
    color: "orange",
    icon: <HelpCircle />,
  },
};

function ConnectionIndicator({
  color,
  tooltip,
  icon,
}: {
  color: string;
  tooltip?: string;
  icon: ReactElement<LucideProps>;
}) {
  return (
    <Tooltip>
      <TooltipTrigger className="h-full mx-0.5">
        {cloneElement(icon, {
          size: 12,
          color,
          className: "",
        })}
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent align="start">
          <p>{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

interface MessagesCounterProps extends PropsWithChildren {
  tooltip?: string;
}

function MessagesCounter({ children, tooltip }: MessagesCounterProps) {
  return (
    <Tooltip>
      <TooltipTrigger className="flex flex-row">{children}</TooltipTrigger>
      {tooltip && (
        <TooltipContent align="start">
          <p>{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}

function PubSubIndicator({ state }: { state: PubSubState }) {
  return <ConnectionIndicator {...connectionStates[state]} />;
}

function SyncIndicator({ state }: { state: SyncState }) {
  return <ConnectionIndicator {...syncStates[state]} />;
}

function MessagesPanelToggle({ onClick }: { onClick?: () => void }) {
  return (
    <button className="rounded-md p-1" onClick={onClick}>
      <Mail size={14} />
    </button>
  );
}

export function StatusBar({
  className,
  pubSubState,
  syncState,
  messagesCount,
  onExpandClick,
  currentPaneIndex = 0,
  totalPanes = 1,
  onNextPane,
  onPreviousPane,
  keyboardHeight = 0,
}: {
  className?: string;
  pubSubState?: PubSubState;
  syncState?: SyncState;
  messagesCount?: number;
  onExpandClick?: () => void;
  currentPaneIndex?: number;
  totalPanes?: number;
  onNextPane?: () => void;
  onPreviousPane?: () => void;
  keyboardHeight?: number;
}) {
  const hasMultiplePanes = totalPanes > 1;
  const isMobile = useMemo(() => isMobilePhone(), []);
  const hasNext = currentPaneIndex < totalPanes - 1;
  const hasPrevious = currentPaneIndex > 0;

  if (isMobile) {
    // Mobile layout with navigation
    return (
      <TooltipProvider delayDuration={50}>
        <div
          className="fixed z-20 left-0 right-0 w-full"
          style={{
            bottom: `${keyboardHeight / 16}rem`,
          }}
        >
          <div className="grid grid-cols-3 items-center px-2 py-2">
            {/* Left section */}
            <div className="flex items-center gap-3">
              {hasMultiplePanes && (
                <div className="flex items-center justify-start gap-2">
                  <LargeButton onClick={onPreviousPane} disabled={!hasPrevious}>
                    <ChevronLeft />
                  </LargeButton>
                </div>
              )}
              <div
                className={cn(
                  "flex items-center",
                  isMobile &&
                    "px-2 py-3 bg-slate-900 bg-opacity-70 rounded border border-slate-700",
                )}
              >
                {pubSubState && <PubSubIndicator state={pubSubState} />}
                {syncState && <SyncIndicator state={syncState} />}
              </div>
            </div>

            {/* Center section */}
            <div className="flex justify-center">
              <div className="px-3 py-2 bg-slate-900 bg-opacity-70 text-white text-sm rounded border border-slate-700">
                {currentPaneIndex + 1} / {totalPanes}
              </div>
            </div>

            {/* Right section */}
            <div className="flex justify-end items-center gap-3">
              <LargeButton onClick={onExpandClick} className="gap-2">
                {messagesCount && messagesCount > 0 && (
                  <MessagesCounter tooltip="Total unseen messages">
                    <span className="text-xs text-white">{messagesCount}</span>
                  </MessagesCounter>
                )}
                <Mail />
              </LargeButton>
              {hasMultiplePanes && (
                <LargeButton onClick={onNextPane} disabled={!hasNext}>
                  <ChevronRight />
                </LargeButton>
              )}
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Desktop layout or mobile without navigation
  return (
    <TooltipProvider delayDuration={50}>
      <div
        className={cn(
          "fixed bottom-0 left-0 z-10 h-8 w-screen p-1 pl-2 pr-2 text-xs flex flex-row shadow-lg shadow-black/50",
          className,
        )}
      >
        {pubSubState && (
          <div>
            <PubSubIndicator state={pubSubState} />
          </div>
        )}
        {syncState && (
          <div>
            <SyncIndicator state={syncState} />
          </div>
        )}
        <div className="grow" />
        {!isMobile && (
          <div className="flex flex-row items-center bg-black bg-opacity-50 rounded-md">
            {messagesCount && messagesCount > 0 ? (
              <MessagesCounter tooltip="Total unseen messages">
                {messagesCount}
              </MessagesCounter>
            ) : null}
            <MessagesPanelToggle onClick={onExpandClick} />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
