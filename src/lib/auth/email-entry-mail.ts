import nodemailer from "nodemailer";

import { readEmailConfig } from "@/lib/leads/email";

export async function sendEntryCode(email: string, code: string): Promise<void> {
  const config = readEmailConfig();
  if (!config) throw new Error("SMTP unavailable");
  const transport = nodemailer.createTransport({
    host: config.host, port: config.port, secure: config.secure, auth: config.auth,
    connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000,
  });
  await transport.sendMail({
    from: config.from, to: email, subject: "DK LAO CMS entrance key",
    text: `Your DK LAO CMS entrance key is ${code}. It expires in 10 minutes. If you did not request it, ignore this email.`,
  });
}
