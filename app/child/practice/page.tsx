import { PracticeFlow } from "@/components/practice-flow";
import { Suspense } from "react";

export default function ChildPracticePage() {
  return (
    <Suspense fallback={<div className="rounded-lg bg-white p-4 shadow-soft">Загружаем занятие...</div>}>
      <PracticeFlow />
    </Suspense>
  );
}
