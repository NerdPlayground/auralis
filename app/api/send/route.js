"use server-only";
import { Resend } from "resend";
import Mailjet from "node-mailjet";

const resend=new Resend(process.env.RESEND_API_KEY);
const mailjet=new Mailjet({
    "apiKey":process.env.MAILJET_API_KEY,
    "apiSecret":process.env.MAILJET_SECRET_KEY,
});

export async function POST(request){
    try{
        const {sender}=await request.json();
        const {response}=await mailjet
        .post("send",{"version":"v3.1"})
        .request({
            "Messages":[{
                "From":{"Email":process.env.DEFAULT_MAILJET_EMAIL},
                "To":[{"Email":process.env.DEFAULT_MAILJET_EMAIL}],
                "Subject":"AURALIS REGISTRATION",
                "TextPart":`Hello, I would like to join Auralis; ${sender}`,
            }]
        });
        return new Response({"status":response.status});
    }
    catch(error){
        return Response.json({error},{status:500});
    }
}
