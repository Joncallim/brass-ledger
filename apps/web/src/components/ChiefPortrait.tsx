import { buildAdvisorPortraitDataUri, type AdvisorPortraitSpec } from "@brass-ledger/shared";

type Props = {
  portrait: AdvisorPortraitSpec;
  displayName: string;
  title: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "w-10 h-11",
  md: "w-16 h-[74px]",
  lg: "w-24 h-28",
};

export function ChiefPortrait({ portrait, displayName, title, size = "md" }: Props) {
  const uri = buildAdvisorPortraitDataUri(portrait);
  return (
    <img
      src={uri}
      alt={`${displayName} — ${title}`}
      className={`${sizeClasses[size]} object-cover border border-border shrink-0`}
    />
  );
}
