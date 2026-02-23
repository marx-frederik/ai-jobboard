import { ApplicationStage } from "@/drizzle/schema";
import {
  CheckCheckIcon,
  CircleHelpIcon,
  Handshake,
  HelpingHand,
  Speech,
  XIcon,
} from "lucide-react";
import { ComponentPropsWithRef } from "react";

export function StageIcon({
  stage,
  ...props
}: { stage: ApplicationStage } & ComponentPropsWithRef<typeof CircleHelpIcon>) {
  const Icon = getIcon(stage);
  return <Icon {...props} />;
}

function getIcon(stage: ApplicationStage) {
  switch (stage) {
    case "denied":
      return XIcon;
    case "applied":
      return HelpingHand;
    case "interested":
      return CheckCheckIcon;
    case "interviewed":
      return Speech;
    case "hired":
      return Handshake;
    default:
      throw new Error(`Unknown application stage ${stage satisfies never}`);
  }
}
