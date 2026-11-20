import { redirect } from "next/navigation";

// The quest map is the lesson list now.
export default function LessonsPage() {
  redirect("/home");
}
