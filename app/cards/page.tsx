import { redirect } from "next/navigation";

// /cards was a broken legacy path that 404'd. We send it to the parent cards page,
// which is where the user expects to manage cards.
export default function CardsRedirect() {
  redirect("/parent/cards");
}
