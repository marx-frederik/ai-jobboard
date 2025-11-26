import { PricingTable as ClerkPricingTable } from "@clerk/nextjs";
export default function PricingTable() {
  return <ClerkPricingTable for="organization" newSubscriptionRedirectUrl="/employer/pricing" />;
}
