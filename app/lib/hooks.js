import { useEffect, useState } from "react";

export function useLocalStorage(key){
    const [storedItem, setStoredItem]=useState("");

    useEffect(()=>{
        const item=localStorage.getItem(key);
        if(item) setStoredItem(item);
    },[key]);

    return storedItem;
}