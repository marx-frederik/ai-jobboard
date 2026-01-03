"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobListingApplicationFormSchema } from "../../jobListings/actions/schemas";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";
import z from "zod";
import { toast } from "sonner";
import { createJobListingApplication } from "../actions/actions";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/LoadingSwap";

export default function JobListingApplicationForm({
  jobListingId,
}: {
  jobListingId: string;
}) {
  const form = useForm({
    resolver: zodResolver(jobListingApplicationFormSchema),
    defaultValues: { coverLetter: "" },
  });

  async function onSubmit(
    data: z.infer<typeof jobListingApplicationFormSchema>
  ) {
    const results = await createJobListingApplication({
      jobListingId,
      unsafeData: data,
    });

    if (results.error) {
      toast.error(results.message);
    }
    toast.success(results.message);
  }

  return (
    <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="coverLetter"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-demo-title">CoverLetter</FieldLabel>
              <MarkdownEditor {...field} markdown={field.value ?? ""} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          variant="default"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Apply
          </LoadingSwap>
        </Button>
      </FieldGroup>
    </form>
  );
}
