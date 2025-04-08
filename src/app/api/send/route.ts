import { EmailTemplate } from "@/components/EmailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const bodyRes = await req.json();
    const { name, email, body, role, company } = bodyRes;

    if (!name || !body || !email) {
      return new Response(
        JSON.stringify({ error: "Required fields are missing" }),
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["bautiberto@gmail.com"],
      subject: "Conact email",
      react: EmailTemplate({ name, email, body, role, company }),
    });

    if (error) {
      console.log(error);
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
