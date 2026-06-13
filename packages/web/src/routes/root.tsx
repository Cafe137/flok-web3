import { redirect } from "react-router-dom";
import { generateRandomSessionName } from "@/lib/utils";

export async function loader() {
  const sessionName = generateRandomSessionName();
  const queryParams = window.location.search;

  return redirect(`/s/${sessionName}${queryParams}`);
}
