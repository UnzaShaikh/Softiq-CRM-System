"use client";

import { Suspense } from "react";
import EditContactContent from "./EditContactContent";

export default function EditContactPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditContactContent />
    </Suspense>
  );
}