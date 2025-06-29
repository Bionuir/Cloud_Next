import { redirect } from "next/navigation";
import { auth } from "./lib/firebase";

export default function Home() {
  redirect("/main");
}
