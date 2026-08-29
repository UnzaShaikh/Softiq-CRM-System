"use client";

import { Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EditContactContent from "./EditContactContent";

export default function EditContactPage() {
  return (
    <Suspense fallback={<DashboardLayout><div style={{ minHeight: "220px" }} /></DashboardLayout>}>
      <EditContactContent />
    </Suspense>
  );
}
