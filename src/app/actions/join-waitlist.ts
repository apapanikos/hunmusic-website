"use server";

import { z } from "zod";

import { site } from "@/lib/site";
import { subscribeEmail } from "@/lib/newsletter/kit";

/**
 * Result of a mailing-list submission.
 *
 * `duplicate` is intentionally a distinct status rather than an error — being
 * already signed up is a success from the visitor's point of view, and the UI
 * shows a confirmation panel either way.
 */
export type WaitlistState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "duplicate" }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

const emailSchema = z
  .email("That doesn't look like an email address.")
  .max(254, "That email address is too long.");

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData
): Promise<WaitlistState> {
  // Honeypot: a field hidden from humans. Anything filling it is a bot, so we
  // return the success shape without writing — no signal that it was caught.
  if (typeof formData.get("company") === "string" && formData.get("company") !== "") {
    return { status: "success" };
  }

  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";

  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return {
      status: "invalid",
      message: parsed.error.issues[0]?.message ?? "Please enter a valid email address.",
    };
  }

  // Validate before calling out, so obvious typos never leave the server and a
  // bad address can't burn a request against the provider's rate limit.
  const result = await subscribeEmail(parsed.data, site.url);

  switch (result.status) {
    case "subscribed":
      return { status: "success" };
    case "already":
      return { status: "duplicate" };
    case "error":
      // The reason is deliberately server-side only: it names the provider and
      // sometimes quotes its response, neither of which is the visitor's
      // problem. This line is what to look for in the Vercel runtime logs.
      console.error("[waitlist] signup failed", result.reason);
      return {
        status: "error",
        message: "Something went wrong on our end. Try again in a moment.",
      };
  }
}
