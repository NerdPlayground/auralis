"use client";
import Link from "next/link";
import { robotoCondensed } from "@/app/ui/fonts";
import { getAccessToken } from "@/app/lib/actions";
import { useEffect, useState, useTransition } from "react";

export default function Page({ searchParams }){
    const initialState=Object.freeze({
        status: false,
        error: false,
        content: null,
    });
    const [message, setMessage]=useState(initialState);
    const [spotifyParams, setParams]=useState(null);
    const [isPending, startTransition]=useTransition();

    useEffect(()=>{
        const spError=searchParams["error"];
        if(spError){
            setMessage({
                status: true, error: true, 
                content: "The application has been denied access to the user's information :(",
            });
            return;
        }

        const {code,state}=searchParams;
        if(code===undefined || state===undefined){
            setMessage({
                status: true, error: true, 
                content: "Code and State are required to access the token :(",
            });
            return;
        }

        setParams({code, state});

    },[searchParams]);

    return (
        <>
            {message.status?(
                <>
                    <Link
                        id="authorize-button" href="/"
                        className={`
                            ${robotoCondensed.className} 
                            ${message.error? 'error':'info'}
                            button
                        `}
                    >
                        Go Back Home
                    </Link>
                    <p
                        className={`
                            message
                            ${message.error? "error-message" : "info-message"}
                        `}
                    >
                        {message.content}
                    </p>
                </>
            ):(
                <>
                    <button
                        id="authorize-button"
                        className={`${robotoCondensed.className} button`}
                        onClick={()=>{
                            startTransition(async()=>{
                                const response=await getAccessToken(spotifyParams);
                                if(!response.success) {
                                    setMessage({
                                        status: true, error: true,
                                        content: response.message,
                                    });
                                    return;
                                }

                                const { access_token, refresh_token, expires_in }=response;
                                localStorage.setItem(
                                    "spotify-package",
                                    `${access_token} | ${refresh_token} | ${expires_in}`
                                );
                                
                                setMessage({
                                    status: true, error: false,
                                    content: "The application has been authorized successfully :)"
                                });
                            });
                        }}
                    >{
                        isPending? `Loading...`:`Get Access Token`
                    }</button>
                    <p className="message"></p>
                </>
            )}
        </>
    );
}