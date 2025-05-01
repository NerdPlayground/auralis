"use client";
import Link from "next/link";
import styles from "./styles.module.scss";
import { use, useEffect, useState } from "react";
import Button from "@/app/components/button/component";
import { robotoCondensed } from "@/app/ui/fonts";
import { getAccessToken, handleEncryption } from "@/app/lib/actions";
import Message from "@/app/components/message/component";

export default function Page({ searchParams }){
    const initialState=Object.freeze({
        status: false,
        error: false,
        content: "-_-",
    });
    const params=use(searchParams);
    const [message, setMessage]=useState(initialState);
    const [spotifyParams, setParams]=useState(null);

    useEffect(()=>{
        const spError=params["error"];
        if(spError){
            setMessage({
                status: true, error: true, 
                content: "The application has been denied access to the user's information :(",
            });
            return;
        }

        const {code,state}=params;
        if(code===undefined || state===undefined){
            setMessage({
                status: true, error: true, 
                content: "Code and State are required to access the token :(",
            });
            return;
        }

        setParams({code, state});

    },[params]);
    
    return (
        <div id="authorize">
            <div>
                {message.status?(
                    <Button
                        icon={"home"} button={false}
                        element={(
                            <Link
                                href="/"
                                className={`
                                    ${robotoCondensed.className} 
                                    ${message.error? styles.error:styles.info}
                                    ${styles.default} button
                                `}
                            >
                                {`Go Back Home`}
                            </Link>
                        )}
                    />
                ):(
                    <Button
                        icon={"key"}
                        active={true}
                        label={`Get Access Token`}
                        action={{
                            method: getAccessToken,
                            arguments: [spotifyParams],
                        }}
                        reaction={async (response)=>{
                            const { access_token, refresh_token, expires_in }=response;
                            localStorage.setItem(
                                "spotify-package",
                                await handleEncryption({
                                    details:`${access_token} | ${refresh_token} | ${expires_in}`
                                })
                            );
                        }}
                        setMessage={setMessage}
                    />
                )}
            </div>
            <Message content={message}/>
        </div>
    );
}
