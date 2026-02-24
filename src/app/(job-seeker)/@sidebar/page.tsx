import { Suspense } from "react";
import { JobBoardSidebar } from "../_shared/JobBoardSidebar";

export default function JobBoardSideBarPage() {
  return (
    <Suspense fallback={null}>
      <JobBoardSidebar />
    </Suspense>
  );
}
