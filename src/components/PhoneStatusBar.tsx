type PhoneStatusBarProps = {
  /** `frame` aligns with island on the phone chrome; `screen` aligns inside the clipped display. */
  placement?: "frame" | "screen";
};

/** iOS-style status bar for phone mockups — place as sibling of the Dynamic Island. */
export function PhoneStatusBar({ placement = "frame" }: PhoneStatusBarProps) {
  const position =
    placement === "screen"
      ? "top-[5px] left-3 right-3 z-10"
      : "top-[14px] left-[18px] right-[18px] z-30";

  return (
    <div
      className={`absolute ${position} h-[22px] flex items-center justify-between pointer-events-none select-none text-pure-black`}
      aria-hidden="true"
    >
      <span className="text-[12px] font-semibold tracking-tight tabular-nums leading-none pl-0.5">
        9:41
      </span>

      <div className="flex items-center gap-[5px]">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden="true">
          <rect x="0" y="8" width="3" height="4" rx="0.6" />
          <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.6" />
          <rect x="9" y="3" width="3" height="9" rx="0.6" />
          <rect x="13.5" y="0.5" width="3" height="11.5" rx="0.6" />
        </svg>

        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
          <path d="M8 9.6a1.35 1.35 0 1 1 0 2.7 1.35 1.35 0 0 1 0-2.7Z" />
          <path
            fillRule="evenodd"
            d="M8 6.2c1.35 0 2.58.5 3.52 1.32l-1.1 1.18A3.3 3.3 0 0 0 8 7.85c-.9 0-1.72.34-2.35.9L4.55 7.55A4.9 4.9 0 0 1 8 6.2Zm0-3.35c2.28 0 4.35.86 5.95 2.28L12.8 6.3A6.55 6.55 0 0 0 8 4.55c-1.82 0-3.48.68-4.75 1.8L2.1 5.18A8.2 8.2 0 0 1 8 2.85Z"
          />
        </svg>

        <div className="flex items-center gap-[1px]">
          <div className="relative w-[22px] h-[11px] rounded-[3px] border-[1.5px] border-current p-[1.5px]">
            <div className="h-full w-[70%] rounded-[1px] bg-current" />
          </div>
          <div className="w-[1.5px] h-[4px] rounded-r-full bg-current" />
        </div>
      </div>
    </div>
  );
}
