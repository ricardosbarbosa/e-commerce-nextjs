import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  idempotencyKey?: string;
};

let resend: Resend | null = null;

function resendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  resend ??= new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  idempotencyKey,
}: SendEmailInput) {
  const client = resendClient();
  const from =
    process.env.RESEND_FROM_EMAIL ?? "E-commerce <onboarding@resend.dev>";

  if (!client) {
    console.info(
      [
        "Email delivery skipped because RESEND_API_KEY is not set.",
        `To: ${to}`,
        `Subject: ${subject}`,
        "",
        text,
      ].join("\n"),
    );
    return;
  }

  const { error } = await client.emails.send(
    {
      from,
      to: [to],
      subject,
      text,
      html,
    },
    idempotencyKey ? { idempotencyKey } : undefined,
  );

  if (error) {
    console.error(`Failed to send email to ${to}: ${error.message}`);
  }
}
