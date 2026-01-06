import { Badge } from "@/components/ui/badge";
import { JobListingTable, wageIntervalEnum } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import {
  formatExperienceLevel,
  formatJobListingLocation,
  formatJobType,
  formatLocationRequirement,
  formatWage,
} from "../lib/formatters";
import {
  BanknoteIcon,
  BuildingIcon,
  GraduationCapIcon,
  HourglassIcon,
  MapPinIcon,
} from "lucide-react";

export default function JobListingBadges({
  jobListing: {
    isFeatured,
    wage,
    wageInterval,
    city,
    stateAbbreviation,
    type,
    locationRequirement,
    experienceLevel,
  },
  className,
}: {
  jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | "wage"
    | "wageInterval"
    | "stateAbbreviation"
    | "city"
    | "type"
    | "experienceLevel"
    | "locationRequirement"
    | "isFeatured"
  >;
  className?: string;
}) {
  const badgeProps = {
    variant: "outline",
    className: cn(isFeatured && "border-primary/35"),
  } satisfies ComponentProps<typeof Badge>;
  return (
    <>
      {isFeatured && (
        <Badge
          {...badgeProps}
          className={cn(
            className,
            "border-feature bg-featured text-featured-foreground"
          )}
        >
          Featured
        </Badge>
      )}
      {wage != null && wageInterval != null && (
        <Badge {...badgeProps}>
          <BanknoteIcon />
          {formatWage(wage, wageInterval)}
        </Badge>
      )}
      {(stateAbbreviation != null || city != null) && (
        <Badge {...badgeProps}>
          <MapPinIcon />
          {formatJobListingLocation({ city, stateAbbreviation })}
        </Badge>
      )}
      <Badge {...badgeProps}>
        <BuildingIcon />
        {formatLocationRequirement(locationRequirement)}
      </Badge>
      <Badge {...badgeProps}>
        <HourglassIcon />
        {formatJobType(type)}
      </Badge>
      <Badge {...badgeProps}>
        <GraduationCapIcon />
        {formatExperienceLevel(experienceLevel)}
      </Badge>
    </>
  );
}
