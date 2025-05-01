import "server-only";
import { SignJWT, jwtVerify } from "jose";

const sessionSecret=process.env.SESSION_SECRET;
const encodedKey=new TextEncoder().encode(sessionSecret);

export async function encrypt(payload){
    return new SignJWT(payload)
    .setProtectedHeader({alg:"HS256"})
    .setIssuedAt()
    .sign(encodedKey);
}

export async function decrypt(session){
    if(!session) return;
    try{
        const {payload}=await jwtVerify(
            session, encodedKey,
            {algorithms:["HS256"],}
        );
        return payload;
    }
    catch(error){
        console.log("Failed to verify session");
    }
}
