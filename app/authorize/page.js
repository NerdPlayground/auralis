"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/app/components/button";
import { robotoCondensed } from "@/app/ui/fonts";
import { getAccessToken } from "@/app/lib/actions";

export default function Page({ searchParams }){
    const initialState=Object.freeze({
        status: false,
        error: false,
        content: null,
    });
    const [message, setMessage]=useState(initialState);
    const [spotifyParams, setParams]=useState(null);

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
                    <Button
                        active={true}
                        label={`Get Access Token`}
                        action={{
                            method: getAccessToken,
                            arguments: [spotifyParams],
                        }}
                        reaction={(response)=>{
                            const { access_token, refresh_token, expires_in }=response;
                            localStorage.setItem(
                                "spotify-package",
                                `${access_token} | ${refresh_token} | ${expires_in}`
                            );
                        }}
                        setMessage={setMessage}
                    />
                    <p className="message"></p>
                </>
            )}
        </>
    );
}