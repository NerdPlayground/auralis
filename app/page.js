"use client";
import { useEffect, useTransition } from "react";
import { useLocalStorage } from "@/app/lib/hooks";
import { robotoCondensed } from "@/app/ui/fonts";
import { handleAuthorization, handleUserPlaylist } from "@/app/lib/actions";

export default function Root(){
    const spotifyPackage=useLocalStorage();
    const [isPending, startTransition]=useTransition();

    return (
        <>
            <button
                id="home-button"
                className={`${robotoCondensed.className} button`}
                onClick={()=>{
                    startTransition(()=>{
                        if(!spotifyPackage) handleAuthorization();
                        else handleUserPlaylist(spotifyPackage);
                    });
                }}
            >{
                isPending? `Loading...` : 
                spotifyPackage? `Get User Playlist`:`Authorize Application`
            }</button>
            <p className="message"></p>
        </>
    );
}