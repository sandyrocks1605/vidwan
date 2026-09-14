import { NextResponse } from "next/server";
import { Resend } from "resend";

type RegistrationNotification = {
  parentName: string;
  studentName: string;
  age: number;
  track: string;
  email: string;
  phone: string;
  experience: string;
  referral: string | null;
  additionalInfo: string | null;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const isValidRegistration = (
  value: unknown
): value is RegistrationNotification => {
  if (!value || typeof value !== "object") return false;

  const registration = value as Partial<RegistrationNotification>;

  return (
    typeof registration.parentName === "string" &&
    registration.parentName.trim().length > 0 &&
    typeof registration.studentName === "string" &&
    registration.studentName.trim().length > 0 &&
    typeof registration.age === "number" &&
    Number.isInteger(registration.age) &&
    registration.age >= 6 &&
    registration.age <= 21 &&
    typeof registration.track === "string" &&
    registration.track.trim().length > 0 &&
    typeof registration.email === "string" &&
    /^\S+@\S+\.\S+$/.test(registration.email) &&
    typeof registration.phone === "string" &&
    registration.phone.replace(/\D/g, "").length >= 10 &&
    registration.phone.replace(/\D/g, "").length <= 15 &&
    typeof registration.experience === "string" &&
    registration.experience.trim().length > 0 &&
    (registration.referral === null || typeof registration.referral === "string") &&
    (registration.additionalInfo === null ||
      typeof registration.additionalInfo === "string")
  );
};

const displayValue = (value: string | null) =>
  value?.trim() ? escapeHtml(value.trim()) : "Not provided";

const getErrorDiagnostics = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return { name: typeof value, message: String(value) };
  }

  const error = value as {
    name?: unknown;
    message?: unknown;
    statusCode?: unknown;
    status?: unknown;
    error?: {
      name?: unknown;
      message?: unknown;
    };
  };

  return {
    name: typeof error.name === "string" ? error.name : undefined,
    message: typeof error.message === "string" ? error.message : undefined,
    statusCode:
      typeof error.statusCode === "number"
        ? error.statusCode
        : typeof error.status === "number"
          ? error.status
          : undefined,
    resendError:
      error.error && typeof error.error === "object"
        ? {
            name:
              typeof error.error.name === "string"
                ? error.error.name
                : undefined,
            message:
              typeof error.error.message === "string"
                ? error.error.message
                : undefined,
          }
        : undefined,
  };
};

export async function POST(request: Request) {
  console.info("Registration notification route called.");

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isValidRegistration(body)) {
    return NextResponse.json(
      { error: "Invalid registration data." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.RESEND_NOTIFICATION_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  console.info("Registration notification configuration status.", {
    hasApiKey: Boolean(apiKey),
    hasNotificationEmail: Boolean(notificationEmail),
    hasFromEmail: Boolean(fromEmail),
  });

  if (!apiKey || !notificationEmail || !fromEmail) {
    console.error(
      "Registration notification is not configured. Set RESEND_API_KEY, RESEND_NOTIFICATION_EMAIL, and RESEND_FROM_EMAIL."
    );
    return NextResponse.json(
      { error: "Registration notification is not configured." },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);
  const track = escapeHtml(body.track.trim());
  const experience = escapeHtml(body.experience.trim());
  const phone = escapeHtml(body.phone.trim());
  const studentName = escapeHtml(body.studentName.trim());

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: notificationEmail,
      subject: `New Vidwan Registration — ${body.studentName.trim()}`,
      html: `
        <div style="margin:0;background:#071321;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#f8fbff">
          <div style="max-width:640px;margin:0 auto;border:1px solid #21476f;border-radius:20px;background:#0a1b2e;padding:32px">
            <p style="margin:0;color:#78b8ff;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase">VIDWAN</p>
            <h1 style="margin:16px 0 28px;font-size:30px;line-height:1.1;color:#ffffff">New Vidwan Registration</h1>
            <table style="width:100%;border-collapse:collapse;font-size:15px">
              <tr><td style="padding:12px 0;border-bottom:1px solid #183451;color:#8fb5d9">Student Name</td><td style="padding:12px 0;border-bottom:1px solid #183451;color:#ffffff">${studentName}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #183451;color:#8fb5d9">Student Age</td><td style="padding:12px 0;border-bottom:1px solid #183451;color:#ffffff">${body.age}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #183451;color:#8fb5d9">Parent Name</td><td style="padding:12px 0;border-bottom:1px solid #183451;color:#ffffff">${escapeHtml(body.parentName.trim())}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #183451;color:#8fb5d9">Parent Email</td><td style="padding:12px 0;border-bottom:1px solid #183451;color:#ffffff">${escapeHtml(body.email.trim())}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #183451;color:#8fb5d9">Phone</td><td style="padding:12px 0;border-bottom:1px solid #183451;color:#ffffff">${phone}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #183451;color:#8fb5d9">Preferred Track</td><td style="padding:12px 0;border-bottom:1px solid #183451;color:#ffffff">${track}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #183451;color:#8fb5d9">Prior MUN Experience</td><td style="padding:12px 0;border-bottom:1px solid #183451;color:#ffffff">${experience}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid #183451;color:#8fb5d9">Heard About Vidwan</td><td style="padding:12px 0;color:#ffffff">${displayValue(body.referral)}</td></tr>
            </table>
            <div style="margin-top:24px;border-top:1px solid #183451;padding-top:20px">
              <p style="margin:0 0 10px;color:#8fb5d9;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Additional Information</p>
              <p style="margin:0;white-space:pre-wrap;color:#d8e7f5;font-size:15px;line-height:1.6">${displayValue(body.additionalInfo)}</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error(
        "Resend registration notification failed.",
        getErrorDiagnostics(error)
      );
      return NextResponse.json(
        { error: "Unable to send registration notification." },
        { status: 502 }
      );
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error(
      "Resend registration notification failed.",
      getErrorDiagnostics(error)
    );
    return NextResponse.json(
      { error: "Unable to send registration notification." },
      { status: 502 }
    );
  }
}
