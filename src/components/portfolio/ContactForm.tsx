import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { SITE_LINKS } from "@/data/siteLinks";

const FORMSPREE_FORM_ID = import.meta.env.VITE_FORMSPREE_FORM_ID ?? "";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Tell me your name (2 characters or more)."),
  email: z.string().trim().email("That email address doesn't look right."),
  subject: z.string().trim().max(120, "Keep the subject under 120 characters.").optional(),
  message: z
    .string()
    .trim()
    .min(20, "Give me a bit more detail — 20 characters or more.")
    .max(4000, "That's over 4000 characters. Email me the long version instead."),
  /** Honeypot: must stay empty. */
  company: z.string().max(0).optional(),
});

type ContactValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  /** Pre-fills the subject line, e.g. from a service intent card. */
  defaultSubject?: string;
  defaultMessage?: string;
}

const fieldClass =
  "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-neural focus:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive";
const labelClass = "label-mono mb-1.5 block text-neural-type";

export default function ContactForm({ defaultSubject = "", defaultMessage = "" }: ContactFormProps) {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getFieldState,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: defaultSubject, message: defaultMessage, company: "" },
    mode: "onBlur",
  });

  // Intent changes should help compose the enquiry, not erase it. Programmatic
  // defaults continue to follow the selected intent until the visitor edits a
  // field themselves; names, email addresses, and handwritten copy are never
  // remounted or reset.
  useEffect(() => {
    if (!getFieldState("subject").isDirty) {
      setValue("subject", defaultSubject, { shouldDirty: false, shouldValidate: false });
    }
    if (!getFieldState("message").isDirty) {
      setValue("message", defaultMessage, { shouldDirty: false, shouldValidate: false });
    }
  }, [defaultMessage, defaultSubject, getFieldState, setValue]);

  const onSubmit = async (values: ContactValues) => {
    setSubmitError("");

    // Silently accept obvious bot submissions instead of telling them why.
    if (values.company) {
      setSent(true);
      reset();
      return;
    }

    if (!FORMSPREE_FORM_ID) {
      setSubmitError(
        "The form isn't configured yet, so this wouldn't reach me. Email me directly instead — the link is below.",
      );
      return;
    }

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: values.subject || "Portfolio enquiry",
          message: values.message,
          _replyto: values.email,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `The form service returned ${response.status}.`);
      }

      reset();
      setSent(true);
      navigate("/thanks");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? `${error.message} Try again, or email me directly.`
          : "Something went wrong. Try again, or email me directly.",
      );
    }
  };

  if (sent) {
    return (
      <div
        className="rounded-lg border border-systems/40 bg-systems/5 p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 size={32} className="mx-auto mb-4 text-systems-type" aria-hidden="true" />
        <h3 className="text-xl text-foreground">Message sent</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          I read everything that arrives here and usually reply within 24–48 hours.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 font-mono text-2xs uppercase tracking-widest text-systems-type hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-lg border border-neural/25 bg-card p-6 sm:p-7"
    >
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={fieldClass}
            {...register("name")}
          />
          {errors.name && (
            <p id="contact-name-error" className="mt-1.5 text-2xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={errors.email ? "true" : undefined}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={fieldClass}
            {...register("email")}
          />
          {errors.email && (
            <p id="contact-email-error" className="mt-1.5 text-2xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="contact-subject" className={labelClass}>
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          placeholder="What's this about?"
          aria-invalid={errors.subject ? "true" : undefined}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          className={fieldClass}
          {...register("subject")}
        />
        {errors.subject && (
          <p id="contact-subject-error" className="mt-1.5 text-2xs text-destructive">
            {errors.subject.message}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="contact-message" className={labelClass}>
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={5}
          placeholder="What are you building, and where is it slow or stuck?"
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`${fieldClass} resize-none`}
          {...register("message")}
        />
        {errors.message && (
          <p id="contact-message-error" className="mt-1.5 text-2xs text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Honeypot — visually and programmatically hidden from people. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" type="text" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div aria-live="assertive" role={submitError ? "alert" : undefined}>
        {submitError && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-thermal px-5 py-3 font-mono text-2xs uppercase tracking-widest text-on-thermal transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
      >
        {isSubmitting ? (
          "Sending…"
        ) : (
          <>
            <Send size={16} />
            Send message
          </>
        )}
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Prefer email?{" "}
        <a
          href={SITE_LINKS.email}
          className="text-interface-type underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Email me directly
        </a>
        .
      </p>
    </form>
  );
}
