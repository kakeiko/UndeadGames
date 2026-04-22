import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const cookieStore = await cookies();

  if (!cookieStore.has("steamid")) {
    redirect("/login");
  }

  return <DashboardClient />;
}
