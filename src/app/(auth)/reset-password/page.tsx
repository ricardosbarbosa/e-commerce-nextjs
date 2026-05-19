import ResetPasswordForm from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const token = params.token ?? null;
  const tokenError =
    params.error === "INVALID_TOKEN"
      ? "This reset link is invalid or expired."
      : null;

  return <ResetPasswordForm token={token} tokenError={tokenError} />;
}
