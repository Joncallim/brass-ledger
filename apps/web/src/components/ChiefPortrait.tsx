import { buildAdvisorPortraitDataUri, type SpriteSpec } from "@brass-ledger/shared";

type Props = {
  sprite: SpriteSpec;
  title: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "w-12 h-14",
  md: "w-[72px] h-[84px]",
  lg: "w-24 h-28",
};

export function ChiefPortrait({ sprite, title, size = "md" }: Props) {
  const uri = buildAdvisorPortraitDataUri(sprite);
  return (
    <img
      src={uri}
      alt={`${sprite.displayName} — ${title}`}
      className={`${sizeClasses[size]} object-cover ring-1 ring-border shrink-0`}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
