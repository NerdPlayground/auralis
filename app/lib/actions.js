"use server";
import z, { email } from 'zod';
import { redirect } from 'next/navigation'
import { decrypt, encrypt } from './session';
import { headers } from 'next/headers';

function errorDescription(status,segment=0,message=null){
    switch(status){
        case 400: {switch(segment){
            case 0: return "The application access has been revoked. Please re-authorize";
            case 1: return "The request has missing or invalid fields. Please contact support";
            case 2: return message;
        }}
        case 401: return "Your access token has expired. Please get a new one";
        case 403: {switch(segment){
            case 0: return "You can't perform this action. Please contact support";
            case 1: return "Seems like you aren't registered. Please wait for a slot to be available";
        }}
        case 429: return "You have made too many requests. Please try again later";
        case 408: return "Looks like you are offline. Please go back online to continue";
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
        "user-read-email",
        "playlist-read-private",
        "playlist-modify-private",
        "playlist-modify-public",
        "user-read-currently-playing",
    ]);
    const ORIGIN=(await headers()).headers.origin;
    console.log(ORIGIN);

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
    let response={};
    try{
        const 
            client_id=process.env.CLIENT_ID,
            client_secret=process.env.CLIENT_SECRET,
            authorization=new Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    
        response=await fetch("https://accounts.spotify.com/api/token",{
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
    catch(error){
        let 
            segment=error.name==="TypeError"?0:1,
            status=error.name==="TypeError"?408:response.status;
        
        console.log("==================================================");
        console.log(`Error: ${status}`);
        console.log(`${error}`);
        console.log("==================================================");

        return{
            success: false, type: `${status}`,
            message: errorDescription(status,segment),
        };
    }
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

export async function removeEmail(){
    return{
        success: true,
        message: "Your email has been deleted. Please provide the updated one to continue"
    }
}

function validateEmail(user_email){
    const EmailSchema=z.object({
        email: z.email({
            message:"Please use your official spotify email. Here's a format; jdoe@example.com"
        })
    });

    const validated_data=EmailSchema.safeParse({email:user_email});
    if(!validated_data.success) return{
        success: false, type: `${400}`,
        message: errorDescription(
            400,2,validated_data.error.issues[0].message
        ),
    }

    return { success: true };
}

export async function joinAuralis(user_email){
    const validation_response=validateEmail(user_email);
    if(!validation_response.success) return validation_response;

    try{
        const response=await fetch(`${process.env.BASE_URL}/api/send`,{
            method:"POST",
            headers:{"content-type":"application/json"},
            body:JSON.stringify({"sender":user_email}),
        });

        const status=response.status===200;
        return{
            success:status,
            message:(!status?
                errorDescription(response.status):
                "Your request has been sent. Time for the waiting game"
            )
        };
    }
    catch(error){
        let status=error.name==="TypeError"?408:0;
        console.log("==================================================");
        console.log(`Error: ${status}`);
        console.log(`${error}`);
        console.log("==================================================");

        return{
            success: false, type: `${status}`,
            message: errorDescription(status),
        };
    }
}

async function performAction(url,access_token=null,method="GET",content_type="",body={}){
    let response={};
    try{
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

        response=await fetch(url,options);
        let results=!response.body? null: await response.json();
        if(!response.ok){
            const {status,message}=results.error;
            console.log("==================================================");
            console.log(`Error: ${status}`);
            console.log(`Description: ${message}`);
            console.log("==================================================");
            
            const segment=["Missing","Invalid"].some(term=>message.includes(term))?1:0;
            return{
                success: false, type: `${status}`, segment: segment, 
                message: errorDescription(status,segment),
            }
        }
        return results;
    }
    catch(error){
        let 
            segment=error.name==="TypeError"?0:1,
            status=error.name==="TypeError"?408:response.status;
        
        console.log("==================================================");
        console.log(`Error: ${status}`);
        console.log(`${error}`);
        console.log("==================================================");

        return{
            success: false, type: `${status}`,
            message: errorDescription(status,segment),
        };
    }
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
        user_email: results?.email,
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

async function getTracks(access_token,playlist_id,offset,retrieved){
    const limit=50;
    const params=new URLSearchParams();
    params.append("fields","total,offset,limit,items(track.uri,track.name)");
    params.append("limit",limit);
    params.append("offset",offset);
    const results=await performAction(
        `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?${params}`,
        access_token,
    );
    if(results?.success===false) return results;

    const total_items=results.items.length;
    const new_items=[...retrieved,...results.items];
    if(results.total > total_items && total_items===limit)
        return getTracks(access_token,playlist_id,offset+limit,new_items);
    else return new_items;
}

export async function updateTopTracks(access_token,playlist_id,tracks){
    let results=await getTracks(access_token,playlist_id,0,[]);
    if(results?.success===false) return results;
    
    const retrieved=results.map(result=>result.track.uri);
    const filtered=tracks.filter(track=>!retrieved.includes(track));
    let message="Your Top Tracks have not changed yet. Keep enjoying Spotify";
    if(filtered.length>=1){
        const results=await performAction(
            `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
            access_token,"POST","application/json",filtered
        );
        if(results?.success===false) return results;
        message=`${filtered.length} track${filtered.length===1?' has':'s have'} been added to your playlist. Enjoy :)`
    }

    return {
        success: true,
        message: message,
    };
}

export async function getTopTracks(access_token){
    const params=new URLSearchParams();
    params.append("time_range","long_term");
    params.append("limit",50);
    const results=await performAction(
        `https://api.spotify.com/v1/me/top/tracks?${params}`,
        access_token
    );

    if(results?.success===false) return results;
    const tracks=results?.items;
    return{
        success: true,
        message: `Here are 5 of your top tracks. There are a total of ${tracks.length}`,
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
