"use client";
import { 
    handleAuthorization, 
    handleUserPlaylist, 
    refreshAccessToken 
} from "@/app/lib/actions";
import { useState } from "react";
import Button from "@/app/components/button";
import { useLocalStorage } from "@/app/lib/hooks";
import { robotoCondensed } from "@/app/ui/fonts";

function Auth({ item, message, setMessage, refresh_token }){
    return (
        (item==="" || (message.error && message.type==="403"))?(
            <Button
                active={true}
                label={`Authorize Application`}
                action={{
                    method: handleAuthorization,
                }}
                setMessage={setMessage}
            />
        ):
        (message.error && message.type==="401")?(
            <Button
                active={true}
                label={`Get Access Token`}
                action={{
                    method: refreshAccessToken,
                    arguments: [refresh_token],
                }}
                setMessage={setMessage}
                reaction={(response)=>{
                    const { access_token, refresh_token, expires_in }=response;
                    localStorage.setItem(
                        "spotify-package",
                        `${access_token} | ${refresh_token} | ${expires_in}`
                    );
                }}
            />
        ):
        (
            <p className={`${robotoCondensed.className} label`}>
                {`Have Fun 😉`}
            </p>
        )
    );
}

export default function Root(){
    const initialState=Object.freeze({
        status: false,
        type: null,
        error: false,
        content: "-_-",
    });
    const [message, setMessage]=useState(initialState);
    const item=useLocalStorage("spotify-package");
    const [access_token, refresh_token, expires]=item.split(' | ');

    const menuItems=Object.freeze([
        {
            label: "Turn Queue to Playlist",
            method: handleUserPlaylist,
            arguments: [access_token],
        },
    ]);
    
    return (
        <div id="container">
            <div id="authorization" className="container">
                <Auth
                    item={item}
                    message={message}
                    setMessage={setMessage}
                    refresh_token={refresh_token}
                />
            </div>
            <div id="menu" className="container">{
                menuItems.map(menuItem=>{return (
                    <Button
                        key={menuItem.label}
                        label={menuItem.label}
                        action={{
                            method: menuItem.method,
                            arguments: [...menuItem.arguments],
                        }}
                        setMessage={setMessage}
                        active={item && !message.error}
                    />
                );})
            }</div>
            <div id="messages" className="container">
                <p className={`message ${message.error?"error":"info"}-message`}>
                    {message.content}
                </p>
            </div>
        </div>
    );
}