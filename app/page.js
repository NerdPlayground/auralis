"use client";
import { useEffect, useState } from "react";
import Display from "@/app/display/component";
import Container from "@/app/container/component";
import { useLocalStorage } from "@/app/lib/hooks";
import { getUserProfile } from "./lib/actions";

export default function Root(){
    const item=useLocalStorage("spotify-package");
    const [access_token, refresh_token, expires]=item.split(' | ');

    const user_details=useLocalStorage("spotify-user");
    const [user_id, display_name]=user_details.split(' | ');

    const initialState=Object.freeze({
        status: false,
        type: null,
        error: false,
        segment: "0",
        content: "-_-",
    });
    const [message, setMessage]=useState(initialState);
    const [display, setDisplay]=useState(null);
    const [results, setResults]=useState(null);
    const [index, setIndex]=useState(0);

    useEffect(()=>{
        (async function fetchDetails(){
            if(access_token && display_name===""){
                const response=await getUserProfile(access_token);
                if(response?.success){
                    localStorage.setItem(
                        "spotify-user",
                        `${response.user_id} | ${response.display_name}`
                    );
                }
            }
        })();
    },[access_token,display_name]);

    return (
        <div id="platform">
            <Display
                display_name={display_name}
                index={index}
                setIndex={setIndex}
                display={display}
                setDisplay={setDisplay}
                results={results?.sample}
            />
            <Container
                item={item!==""}
                user_id={user_id}
                access_token={access_token}
                refresh_token={refresh_token}
                message={message}
                setMessage={setMessage}
                results={results?.results}
                setResults={setResults}
                setDisplay={setDisplay}
            />
        </div>
    );
}
