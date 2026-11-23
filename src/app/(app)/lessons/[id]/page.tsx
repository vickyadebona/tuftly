import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonFlow } from "@/components/LessonFlow";
import { LessonSkeleton } from "@/components/Skeleton";
import { getAllLessonIds, getLesson } from "@/content";

export function generateStaticParams() {
  return getAllLessonIds().map((id) => ({ id }));
}

async function LessonContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();

  return <LessonFlow lesson={lesson} />;
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Suspense fallback={<LessonSkeleton />}>
        <LessonContent params={params} />
      </Suspense>
    </div>
  );
}
