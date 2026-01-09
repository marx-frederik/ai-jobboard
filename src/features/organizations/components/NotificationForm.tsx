"use client";
import { OrganizationUserSettingsTable } from "@/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import z from "zod";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/LoadingSwap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RatingIcons } from "@/features/jobListingApplications/components/RatingIcons";
import { RATING_OPTIONS } from "@/features/jobListingApplications/data/constants";
import { OrganizationUserSettingsSchema } from "../actions/schemas";
import { updateOrganizationUserSettings } from "../actions/organizationUserSettingActions";
import { toast } from "sonner";

const ANY_VALUE = "any";

export function NotificationForm({
  notificationSettings,
}: {
  notificationSettings?: Pick<
    typeof OrganizationUserSettingsTable.$inferSelect,
    "newApplicationEmailNotifications" | "minimumRating"
  >;
}) {
  const form = useForm({
    resolver: zodResolver(OrganizationUserSettingsSchema),
    defaultValues: notificationSettings ?? {
      newApplicationEmailNotifications: false,
      minimumRating: null,
    },
  });

  async function onSubmit(
    data: z.infer<typeof OrganizationUserSettingsSchema>
  ) {
    const result = await updateOrganizationUserSettings(data);
    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }
  }
  //to show and hide things dynamically we watch the "newJobEmailNotifications"
  const newApplicationEmailNotifications = form.watch(
    "newApplicationEmailNotifications"
  );

  return (
    <form id="notifications-form" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <FieldGroup>
          <Controller
            name="newApplicationEmailNotifications"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex flex-row space-x-2 justify-between">
                  <div className="">
                    <FieldLabel htmlFor="notifications-form">
                      Daily Email Notifications
                    </FieldLabel>
                    <FieldDescription>
                      Receive emails about new job listing applications.
                    </FieldDescription>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </div>
              </Field>
            )}
          />
          {newApplicationEmailNotifications && (
            <Controller
              name="minimumRating"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex flex-col">
                    <FieldLabel htmlFor="notifications-form">
                      Minimum Rating
                    </FieldLabel>
                    <FieldDescription>
                      Only receive notifications for candidates that meet or
                      exceed this rating. Candidates 3-5 stars should meet all
                      job requirements and are likely a good fit for the role.
                    </FieldDescription>
                  </div>
                  <div className="">
                    <Select
                      value={field.value ? field.value.toString() : ANY_VALUE}
                      onValueChange={(val) =>
                        field.onChange(val === ANY_VALUE ? null : parseInt(val))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue asChild>
                          {field.value === null ? (
                            <span>Any Rating</span>
                          ) : (
                            <RatingIcons
                              className="text-inherit"
                              rating={field.value}
                            />
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ANY_VALUE}>Any Rating</SelectItem>
                        {RATING_OPTIONS.filter((r) => r != null).map(
                          (rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              <RatingIcons
                                rating={rating}
                                className="text-inherti"
                              />
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </div>
                </Field>
              )}
            />
          )}
        </FieldGroup>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Save Notification Settings
          </LoadingSwap>
        </Button>
      </div>
    </form>
  );
}
