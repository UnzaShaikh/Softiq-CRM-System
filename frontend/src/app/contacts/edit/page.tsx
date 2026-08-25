"use client";

import { Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ThemeLoader from "@/components/ui/ThemeLoader";
import EditContactContent from "./EditContactContent";

export default function EditContactPage() {
  return (
    <Suspense fallback={<DashboardLayout><ThemeLoader label="Loading contact..." /></DashboardLayout>}>
      <EditContactContent />
    </Suspense>
  );
}
