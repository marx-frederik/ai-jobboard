import { JobListingApplicationTable, JobListingTable } from "@/drizzle/schema"
import {
  DeletedObjectJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  UserJSON,

} from "@clerk/nextjs/server"
import { EventSchemas, Inngest } from "inngest"

type ClerkWebhookData<T> = {
  data: {
    data: T
    raw: string
    headers: Record<string, string>
  }
}

type Events = {
  "clerk/user.created": ClerkWebhookData<UserJSON>
  "clerk/user.updated": ClerkWebhookData<UserJSON>
  "clerk/user.deleted": ClerkWebhookData<DeletedObjectJSON>
  "clerk/organization.created": ClerkWebhookData<OrganizationJSON>
  "clerk/organization.updated": ClerkWebhookData<OrganizationJSON>
  "clerk/organization.deleted": ClerkWebhookData<DeletedObjectJSON>
}

export const inngest = new Inngest({
  id: "Ai-jobboard",
  schemas: new EventSchemas().fromRecord<Events>(),
})