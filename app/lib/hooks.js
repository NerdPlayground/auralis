import { useEffect, useState } from "react";

export function useLocalStorage(){
    const [stored, setStored]=useState(null);

    useEffect(()=>{
        const spotifyPackage=localStorage.getItem("spotify-package");
        if(spotifyPackage) setStored(spotifyPackage);
    },[]);

    return stored;
}