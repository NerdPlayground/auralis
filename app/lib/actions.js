"use server";
import { redirect } from 'next/navigation'

export async function handleAuthorization(){
    const SCOPES=Object.freeze([
        "playlist-modify-public",
        "playlist-modify-private",
        "user-read-currently-playing",
        "user-read-playback-state",
    ]);

    const url_params=new URLSearchParams({
        response_type: "code",
        client_id: process.env.CLIENT_ID,
        scope: SCOPES.join(" "),
        redirect_uri: "http://localhost:3000/authorize",
        state: process.env.STATE,
    });

    redirect(`https://accounts.spotify.com/authorize?${url_params}`);
}

export async function getAccessToken({code, state}){
    if(process.env.STATE!==state) return {
        success: false,
        message: "The state provided does not match the application's state :(",
    };

    const 
        client_id=process.env.CLIENT_ID,
        client_secret=process.env.CLIENT_SECRET,
        authorization=new Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    const response=await fetch("https://accounts.spotify.com/api/token",{
        method: "POST",
        body: new URLSearchParams({
            code:code,
            grant_type:"authorization_code",
            redirect_uri:"http://localhost:3000/authorize",
        }),
        headers:{
            "Authorization":`Basic ${authorization}`,
            "content-type":"application/x-www-form-urlencoded",
        },
    });

    const results=await response.json();
    if(!response.ok){
        const {error,error_description}=results;
        console.log("==================================================");
        console.log(`Error: ${error}`);
        console.log(`Error Description: ${error_description}`);
        console.log("==================================================");
        return {
            success: false,
            message: "There was an error in processing your request :(",
        };
    }

    return {
        success: true,
        access_token: results.access_token,
        refresh_token: results.refresh_token,
        expires_in: results.expires_in,
    };
}
    
export async function handleUserPlaylist(){
}