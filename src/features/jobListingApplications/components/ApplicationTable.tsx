"use client";
import { DataTable } from "@/components/dataTable/DataTable";
import { DataTableSortableHeader } from "@/components/dataTable/DataTableSortableHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ApplicationStage,
  applicationStages,
  JobListingApplicationTable,
  UserResumeTable,
  UserTable,
} from "@/drizzle/schema";
import { ColumnDef, Table } from "@tanstack/react-table";
import { ReactNode, useOptimistic, useState, useTransition } from "react";
import {
  formatJobListingApplicationStage,
  sortApplicationByStage,
} from "../lib/utils";
import { formatJobListingStatus } from "@/features/jobListings/lib/formatters";
import { StageIcon } from "./StageIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDownCircle, MoreHorizontalIcon } from "lucide-react";
import { RatingIcons } from "./RatingIcons";
import { RATING_OPTIONS } from "../data/constants";
import { updateJobListingApplication } from "../db/jobListingApplication";
import {
  updateJobListingApplicationRating,
  updateJobListingApplicationStage,
} from "../actions/actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { DataTableFacetedFilter } from "@/components/dataTable/DataTableFacetedFilter";
import { Spinner } from "@/components/ui/spinner";

type Application = Pick<
  typeof JobListingApplicationTable.$inferSelect,
  "createdAt" | "stage" | "rating" | "jobListingId"
> & {
  coverLetterMarkdown: ReactNode | null;
  user: Pick<typeof UserTable.$inferSelect, "id" | "name" | "imageUrl"> & {
    resume:
      | (Pick<typeof UserResumeTable.$inferSelect, "resumeFileUrl"> & {
          markdownSummary: ReactNode | null;
        })
      | null;
  };
};

export function ApplicationTable({
  applications,
  canUpdateRating,
  canUpdateStage,
  noResultsMessage = "No Applications",
  disableToolbar = false,
}: {
  applications: Application[];
  canUpdateRating: boolean;
  canUpdateStage: boolean;
  noResultsMessage?: ReactNode;
  disableToolbar?: boolean;
}) {
  return (
    <DataTable
      data={applications}
      columns={getColumns(canUpdateRating, canUpdateStage)}
      noResultsMessage={noResultsMessage}
      ToolbarComponent={disableToolbar ? DisabledToolbar : Toolbar}
      initialFilters={[
        {
          id: "stage",
          value: applicationStages.filter((stage) => stage !== "denied"),
        },
      ]}
    />
  );
}

function Toolbar<T>({
  table,
  disabled,
}: {
  table: Table<T>;
  disabled?: boolean;
}) {
  const hiddenRows = table.getCoreRowModel().rows.length - table.getRowCount();

  return (
    <div className="flex items-center gap-2">
      {table.getColumn("stage") && (
        <DataTableFacetedFilter
          disabled={disabled}
          column={table.getColumn("stage")}
          title="Stage"
          options={applicationStages
            .toSorted(sortApplicationByStage)
            .map((stage) => ({
              label: <StageDetails stage={stage} />,
              value: stage,
              key: stage,
            }))}
        />
      )}
      {table.getColumn("rating") && (
        <DataTableFacetedFilter
          disabled={disabled}
          column={table.getColumn("rating")}
          title="Rating"
          options={RATING_OPTIONS.map((rating, i) => ({
            label: <RatingIcons rating={rating} />,
            value: rating,
            key: i,
          }))}
        />
      )}
      {hiddenRows > 0 && (
        <div className="text-sm text-muted-foreground ml-2">
          {hiddenRows} {hiddenRows > 1 ? "rows" : "row"} hidden
        </div>
      )}
    </div>
  );
}

function DisabledToolbar<T>({ table }: { table: Table<T> }) {
  return <Toolbar table={table} disabled />;
}

export function SkeletonApplicationTable() {
  return (
    <ApplicationTable
      applications={[]}
      canUpdateRating={false}
      canUpdateStage={false}
      disableToolbar
      noResultsMessage={<Spinner className="size-12" />}
    />
  );
}

function getColumns(
  canUpdateRating: boolean,
  canUpdateStage: boolean
): ColumnDef<Application>[] {
  return [
    {
      accessorFn: (row) => row.user.name,
      header: "Name",
      cell: ({ row }) => {
        const user = row.original.user;
        const initials = user.name
          .split(" ")
          .splice(0, 2)
          .map((name) => name.charAt(0).toUpperCase())
          .join("");
        <Avatar className="rounded-full size-6">
          <AvatarImage src={user.imageUrl ?? undefined} alt={user.name} />
          <AvatarFallback className="uppercase bg-primary text-primary-foreground text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>;
        <span>{user.name}</span>;
      },
    },
    {
      accessorKey: "stage",
      header: ({ column }) => (
        <DataTableSortableHeader title="Stage" column={column} />
      ),
      sortingFn: ({ original: a }, { original: b }) => {
        return sortApplicationByStage(a.stage, b.stage);
      },
      filterFn: ({ original }, _, value) => {
        return value.includes(original.stage);
      },
      cell: ({ row }) => (
        <StageCell
          canUpdate={canUpdateRating}
          stage={row.original.stage}
          jobListingId={row.original.jobListingId}
          userId={row.original.user.id}
        />
      ),
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <DataTableSortableHeader title="Rating" column={column} />
      ),
      filterFn: ({ original }, _, value) => {
        return value.includes(original.stage);
      },
      cell: ({ row }) => (
        <RatingCell
          canUpdate={canUpdateStage}
          rating={row.original.rating}
          jobListingId={row.original.jobListingId}
          userId={row.original.user.id}
        />
      ),
    },
    {
      accessorKey: "createdAt",
      accessorFn: (row) => row.createdAt,
      header: ({ column }) => (
        <DataTableSortableHeader title="Applied on" column={column} />
      ),
      filterFn: ({ original }, _, value) => {
        return value.includes(original.stage);
      },
      cell: ({ row }) => row.original.createdAt.toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const jobListing = row.original;
        const resume = jobListing.user.resume;

        return (
          <ActionCell
            coverLetterMarkdown={jobListing.coverLetterMarkdown}
            resumeMarkdown={resume?.markdownSummary}
            resumeUrl={resume?.resumeFileUrl}
            userName={jobListing.user.name}
          />
        );
      },
    },
  ];
}

function StageCell({
  canUpdate,
  stage,
  jobListingId,
  userId,
}: {
  canUpdate: boolean;
  stage: ApplicationStage;
  jobListingId: string;
  userId: string;
}) {
  const [optimisticStage, setOptimisticStage] = useOptimistic(stage);
  const [isPending, startTransition] = useTransition();

  if (!canUpdate) {
    <StageDetails stage={optimisticStage} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("-ml-3", isPending && "opacity-50")}
        >
          <StageDetails stage={optimisticStage} />
          <ChevronDownCircle className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {applicationStages.map((stageValue) => {
            if (stageValue != stage) {
              return (
                <DropdownMenuItem
                  key={stageValue}
                  onClick={() => {
                    startTransition(async () => {
                      // set optimistic stafe
                      setOptimisticStage(stageValue);

                      const res = await updateJobListingApplicationStage(
                        jobListingId,
                        stageValue
                      );

                      if (res?.error) {
                        toast.error(res.message);
                      }
                    });
                  }}
                >
                  {formatJobListingApplicationStage(stageValue)}
                </DropdownMenuItem>
              );
            }
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ActionCell({
  resumeUrl,
  userName,
  resumeMarkdown,
  coverLetterMarkdown,
}: {
  resumeUrl: string | null | undefined;
  userName: string;
  resumeMarkdown: ReactNode | null;
  coverLetterMarkdown: ReactNode | null;
}) {
  const [openModal, setOpenModal] = useState<"resume" | "coverletter" | null>(
    null
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Open Menu</span>
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {resumeUrl != null || resumeMarkdown != null ? (
            <DropdownMenuItem
              onClick={() => {
                setOpenModal("resume");
              }}
            >
              View Resume
            </DropdownMenuItem>
          ) : (
            <DropdownMenuLabel className="text-muted-foreground">
              No Resume
            </DropdownMenuLabel>
          )}
          {coverLetterMarkdown != null ? (
            <DropdownMenuItem
              onClick={() => {
                setOpenModal("coverletter");
              }}
            >
              View Cover Letter
            </DropdownMenuItem>
          ) : (
            <DropdownMenuLabel className="text-muted-foreground">
              No Cover Letter
            </DropdownMenuLabel>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {(resumeMarkdown || resumeUrl) && (
        <Dialog
          open={openModal === "resume"}
          onOpenChange={(o) => setOpenModal(o ? "resume" : null)} // if we change from close to open, we set "coverletter", if it is being closed we set null
        >
          <DialogContent className="lg:max-w-5xl md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Resume</DialogTitle>
              <DialogDescription>{userName}</DialogDescription>
              {resumeUrl && (
                <Button asChild className="self-start">
                  <Link
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Original Resume
                  </Link>
                </Button>
              )}
              <DialogDescription>
                This is an AI-generated summary or the resume
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">{resumeMarkdown}</div>
          </DialogContent>
        </Dialog>
      )}
      {coverLetterMarkdown && (
        <Dialog
          open={openModal === "coverletter"}
          onOpenChange={(o) => setOpenModal(o ? "coverletter" : null)} // if we change from close to open, we set "coverletter", if it is being closed we set null
        >
          <DialogContent className="lg:max-w-5xl md:max-w-3xl max-h[calc(100%-2rem)] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Cover Letter</DialogTitle>
              <DialogDescription>{userName}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">{coverLetterMarkdown}</div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function RatingCell({
  canUpdate,
  rating,
  jobListingId,
  userId,
}: {
  canUpdate: boolean;
  rating: number | null;
  jobListingId: string;
  userId: string;
}) {
  const [optimisticRating, setOptimisticRating] = useOptimistic(rating);
  const [isPending, startTransition] = useTransition();

  if (!canUpdate) {
    <RatingIcons rating={optimisticRating} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("-ml-3", isPending && "opacity-50")}
        >
          <RatingIcons rating={rating} />
          <ChevronDownCircle className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {RATING_OPTIONS.map((ratingValue) => {
            if (ratingValue != rating) {
              return (
                <DropdownMenuItem
                  key={ratingValue ?? "none"}
                  onClick={() => {
                    startTransition(async () => {
                      // set optimistic stafe
                      setOptimisticRating(ratingValue);
                      const res = await updateJobListingApplicationRating(
                        jobListingId,
                        ratingValue
                      );
                    });
                  }}
                >
                  <RatingIcons rating={ratingValue} />
                </DropdownMenuItem>
              );
            }
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StageDetails({ stage }: { stage: ApplicationStage }) {
  return (
    <div className="flex gap-2 items-center">
      <StageIcon stage={stage} className="size-5 text-inhert" />
      <div>{formatJobListingApplicationStage(stage)}</div>
    </div>
  );
}
