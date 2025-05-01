import { useEffect, useState } from "react";
import { handleDecryption } from "./actions";

export function useLocalStorage(key){
    const [storedItem, setStoredItem]=useState("");

    useEffect(()=>{
        (async function fetchData(){
            const item=localStorage.getItem(key);
            const results=await handleDecryption(item,key);
            if(item) setStoredItem(results?.details);
        })();
    },[key]);

    return storedItem;
}