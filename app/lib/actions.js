"use server";
import { redirect } from 'next/navigation'
import { decrypt, encrypt } from './session';
import { headers } from 'next/headers';

function errorDescription(status,segment=0){
    switch(status){
        case 400: {
            switch(segment){
                case 0: return "The application access has been revoked. Please re-authorize";
                case 1: return "The request has missing fields. Please contact support";
            }
        }
        case 401: return "Your access token has expired. Please get a new one";
        case 403: return "You can't perform this action. Please contact support";
        case 429: return "You have made too many requests. Please try again later";
        default: return "There was an error in processing your request. Contact support";
    }
}

export async function handleEncryption(payload){
    return await encrypt(payload);
}

export async function handleDecryption(session){
    return await decrypt(session);
}

export async function handleAuthorization(){
    const SCOPES=Object.freeze([
        "user-top-read",
        "playlist-modify-private",
        "user-read-currently-playing",
    ]);
    const ORIGIN=(await headers()).headers.origin;

    const url_params=new URLSearchParams({
        response_type: "code",
        client_id: process.env.CLIENT_ID,
        scope: SCOPES.join(" "),
        redirect_uri: `${ORIGIN}/authorize`,
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
        
        const status=error==="invalid_grant"?400:0;
        return{
            success: false, type: `${status}`,
            segment: "0", message: errorDescription(status),
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

    const ORIGIN=(await headers()).headers.origin;
    return handleAccessToken(new URLSearchParams({
        code:code,
        grant_type:"authorization_code",
        redirect_uri:`${ORIGIN}/authorize`,
    }));
}

export async function refreshAccessToken(refresh_token){
    return handleAccessToken(new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
    }));
}

async function performAction(url,access_token=null,method="GET",content_type="",body={}){
    let headers={};
    if(access_token) headers.Authorization=`Bearer ${access_token}`;
    let options={method,headers};
    if(method==="POST"){
        options.headers["content-type"]=content_type;
        options={
            ...options,
            body: JSON.stringify(body),
        };
    }
    const response=await fetch(url,options);

    const results=!response.body? null: await response.json();
    if(!response.ok){
        const {status,message}=results.error;
        console.log("==================================================");
        console.log(`Error: ${status}`);
        console.log(`Description: ${message}`); 
        console.log("==================================================");
        
        const segment=message.includes("Missing")?1:0;
        return{
            success: false, type: `${status}`, segment: segment, 
            message: errorDescription(status,segment),
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
    return{
        success: true,
        user_id: results?.id,
        display_name: results?.display_name,
    };
}

function getTrackDetails(item){
    return !item?{}:{
        name:{
            label: item?.name,
            url: item?.external_urls?.spotify,
        },
        explicit: item?.explicit,
        cover: item?.album?.images[1].url,
        artists: item?.artists?.map(artist=>({
            label: artist.name,
            url: artist.external_urls.spotify
        })),
    };
}

export async function getCurrentlyPlaying(access_token){
    console.log("==================================================");
    console.log(access_token);
    console.log("==================================================");
    
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

export async function getTopTracks(access_token){
    const quantity=50;
    const params=new URLSearchParams();
    params.append("time_range","long_term");
    params.append("limit",quantity);
    const results=await performAction(
        `https://api.spotify.com/v1/me/top/tracks?${params}`,
        access_token
    );

    if(results?.success===false) return results;
    const tracks=results?.items;
    return{
        success: true,
        message: `Here are 5 of your top tracks. There are a total of ${quantity}`,
        results: tracks.map(item=>item.uri),
        sample: tracks.slice(0,5).map(item=>getTrackDetails(item))
    }
}

async function createPlaylist(access_token,user_id,data){
    const results=await performAction(
        `https://api.spotify.com/v1/users/${user_id}/playlists`,
        access_token,"POST","application/json",data
    );

    if(results?.success===false) return results;
    return{ playlist_id: results?.id };
}

export async function addTopTracks(access_token,user_id,tracks){
    const create_results=await createPlaylist(access_token,user_id,{
        name:"Top Tracks", public: false,
        description:"A collection of your top tracks for the past year",
    });

    const playlist_id=create_results?.playlist_id;
    if(!playlist_id) return create_results;

    const results=await performAction(
        `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
        access_token,"POST","application/json",tracks
    );

    if(results?.success===false) return results;
    return{
        success: true,
        message: "Your playlist has been added to your account, enjoy :)",
    }
}
