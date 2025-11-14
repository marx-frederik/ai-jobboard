"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobListingSchema } from "../actions/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  experienceLevels,
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/drizzle/schema";
import {
  formatExperienceLevel,
  formatJobType,
  formatLocationRequirement,
  formatWageInterval,
} from "../lib/formatters";
import { StateSelectItems } from "./StateSelectItems";
import { ForwardRefEditor } from "@/components/markdown/MarkdownEditor";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/LoadingSwap";
import { createJobListing } from "../actions/actions";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const NONE_SELECT_ITEM = "none";

export default function JobListingForm() {
  const form = useForm({
    resolver: zodResolver(jobListingSchema),
    defaultValues: {
      title: "",
      description: "",
      stateAbbreviation: null,
      city: null,
      wage: null,
      wageInterval: "yearly",
      experienceLevel: "junior",
      type: "full-time",
      locationRequirement: "in-office",
    },
  });

  async function onSubmit(data: z.infer<typeof jobListingSchema>) {
    const res = await createJobListing(data)
    if(res.error){
      toast.error(res.message)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 @container"
      >
        <div className="grid grid-col-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-0 items-start">
            <FormField
              control={form.control}
              name="wage"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Wage</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      className="rounded-r-none"
                      onChange={(e) =>
                        field.onChange(
                          isNaN(e.target.valueAsNumber)
                            ? null
                            : e.target.valueAsNumber
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wageInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="invisible">Interval</FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) => field.onChange(val ?? null)}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-l-none">
                        / <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wageIntervals.map((interval) => (
                        <SelectItem key={interval} value={interval}>
                          {formatWageInterval(interval)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="grid grid-col-1 @xs:grid-cols-3 gap-x-2 gap-y-6 items-start">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stateAbbreviation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">State</FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) =>
                    field.onChange(val === NONE_SELECT_ITEM ? null : val)
                  }
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.value != null && (
                      <SelectItem
                        value={NONE_SELECT_ITEM}
                        key={NONE_SELECT_ITEM}
                        className="text-muted-foreground"
                      >
                        None
                      </SelectItem>
                    )}
                    <StateSelectItems />
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="locationRequirement"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Location Requirement</FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) => field.onChange(val ?? null)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locationRequirements.map((location) => (
                      <SelectItem key={location} value={location}>
                        {formatLocationRequirement(location)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-col-1 @xs:grid-cols-2 gap-x-4 gap-y-6 items-start">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Job Type</FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) => field.onChange(val ?? null)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jobListingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatJobType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="experienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">Experience Level</FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) => field.onChange(val ?? null)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {formatExperienceLevel(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ForwardRefEditor {...field} markdown={field.value} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Create Job Listing
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
