"use client";
import { useEffect, useTransition } from "react";
import { useLocalStorage } from "@/app/lib/hooks";
import { robotoCondensed } from "@/app/ui/fonts";
import { handleAuthorization, handleUserPlaylist } from "@/app/lib/actions";

export default function Root(){
    const accessToken=useLocalStorage();
    const [isPending, startTransition]=useTransition();

    return (
        <>
            <button
                id="home-button"
                className={`${robotoCondensed.className} button`}
                onClick={()=>{
                    startTransition(()=>{
                        if(accessToken) handleUserPlaylist();
                        else handleAuthorization();
                    });
                }}
            >{
                isPending? `Loading...` : 
                accessToken? `Get User Playlist`:`Authorize Application`
            }</button>
            <p className="message"></p>
        </>
    );
}