"use client";
import { UserNotificationSettingsTable } from "@/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { UserNotificationSettingsSchema } from "../actions/schemas";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/LoadingSwap";
import { toast } from "sonner";
import { updateUserNotificationsSettings } from "../actions/userNotificationActions";

export function NotificationForm({
  notificationSettings,
}: {
  notificationSettings?: Pick<
    typeof UserNotificationSettingsTable.$inferSelect,
    "newJobEmailNotifications" | "aiPrompt"
  >;
}) {
  const form = useForm({
    resolver: zodResolver(UserNotificationSettingsSchema),
    defaultValues: notificationSettings ?? {
      newJobEmailNotifications: false,
      aiPrompt: "",
    },
  });

  async function onSubmit(
    data: z.infer<typeof UserNotificationSettingsSchema>
  ) {
    const result = await updateUserNotificationsSettings(data);
    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }
  }
  //to show and hide things dynamically we watch the "newJobEmailNotifications"
  const newJobEmailNotifications = form.watch("newJobEmailNotifications");

  return (
    <form id="notifications-form" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <FieldGroup>
          <Controller
            name="newJobEmailNotifications"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex flex-row space-x-2 justify-between">
                  <div className="">
                    <FieldLabel htmlFor="notifications-form">
                      Daily Email Notifications
                    </FieldLabel>
                    <FieldDescription>
                      Receive emails about new job listings that match your
                      interests.
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
          {newJobEmailNotifications && (
            <Controller
              name="aiPrompt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="">
                    <FieldLabel htmlFor="notifications-form">
                      AI Prompt
                    </FieldLabel>
                    <FieldDescription>
                      Our AI will use this prompt to filter job listings and
                      only send you nofitifactions for jobs that match your
                      criteria.
                    </FieldDescription>
                  </div>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    className="min-h-32"
                    placeholder="Describe the job you're interested in."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  <FieldDescription>
                    Leave blank to receive all new job listings.
                  </FieldDescription>
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
