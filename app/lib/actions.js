"use server";
import { redirect } from 'next/navigation'

function errorDescription(status){
    switch(status){
        case 401: return "Your access token has expired. Please get a new one";
        case 403: return "You can't perform this action. Please contact support";
        case 429: return "You have made too many requests. Please try again later";
        default: return "There was an error in processing your request. Contact support";
    }
}

export async function handleAuthorization(){
    const SCOPES=Object.freeze([
        "user-read-private",
        "user-read-email",
        "user-top-read",
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

async function handleAccessToken(body){
    const 
        client_id=process.env.CLIENT_ID,
        client_secret=process.env.CLIENT_SECRET,
        authorization=new Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    const response=await fetch("https://accounts.spotify.com/api/token",{
        method: "POST",
        body: body,
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
        console.log(`Description: ${error_description}`);
        console.log("==================================================");
        
        if(error==="invalid_grant") return {
            success: false, type: "400",
            message: "The application access has been revoked. Please re-authorize",
        };

        return {
            success: false,
            message: "There was an error in processing your request. Contact support",
        };
    }

    return {
        success: true,
        access_token: results.access_token,
        refresh_token: results.refresh_token,
        expires_in: results.expires_in,
    };
}

export async function getAccessToken({code, state}){
    if(process.env.STATE!==state) return {
        success: false,
        message: "The state provided does not match the application's state. Use the appropriate authorization flow",
    };

    return handleAccessToken(new URLSearchParams({
        code:code,
        grant_type:"authorization_code",
        redirect_uri:"http://localhost:3000/authorize",
    }));
}

export async function refreshAccessToken(refresh_token){
    return handleAccessToken(new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
    }));
}

async function performAction(url,access_token=null){
    let headers={}
    if(access_token) headers.Authorization=`Bearer ${access_token}`;
    const response=await fetch(url,{headers: headers});

    const results=!response.body? null: await response.json();
    if(!response.ok){
        const {status,message}=results.error;
        console.log("==================================================");
        console.log(`Error: ${status}`);
        console.log(`Description: ${message}`); 
        console.log("==================================================");

        return{
            success: false, type: `${status}`,
            message: errorDescription(status),
        }
    }

    return results;
}

export async function getUserProfile(access_token){
    const results=await performAction(
        "https://api.spotify.com/v1/me/",
        access_token,
    );

    if(results?.success===false) return results;
    const user_id=results?.id;
    const display_name=results?.display_name;
    return{
        success: true,
        user_id: user_id,
        display_name: display_name,
    };
}

function getTrackDetails(item){
    return{
        name: item?.name,
        cover: item?.album?.images[1].url,
        artists: item?.artists?.
        map(artist=>artist.name).join(", "),
    }
}

export async function getCurrentlyPlaying(access_token){
    const results=await performAction(
        "https://api.spotify.com/v1/me/player/currently-playing",
        access_token
    );
    
    if(results?.success===false) return results;
    const item=results?.item;
    return{
        success: true,
        display: getTrackDetails(item),
    };
}

export async function getTopTracks(access_token,user_id){
    const params=new URLSearchParams();
    params.append("time_range","long_term");
    params.append("limit",5);
    const results=await performAction(
        `https://api.spotify.com/v1/me/top/tracks?${params}`,
        access_token
    );

    if(results?.success===false) return results;
    const items=results?.items;
    return{
        success: true,
        results: items.map(item=>getTrackDetails(item)),
    }
}
