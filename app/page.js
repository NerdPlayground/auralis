"use client";
import { useState } from "react";
import Auth from "@/app/authorize/component";
import Button from "@/app/components/button";
import { useLocalStorage } from "@/app/lib/hooks";
import { getCurrentlyPlaying } from "@/app/lib/actions";

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
            label: "Get Currently Playing",
            method: getCurrentlyPlaying,
            arguments: [access_token],
        },
    ]);
    
    return (
        <div id="container">
            <div className="container">
                <Auth
                    item={item}
                    message={message}
                    setMessage={setMessage}
                    refresh_token={refresh_token}
                />
            </div>
            <div className="container">{
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
            <div className="container">
                <p className={`message ${message.error?"error":"info"}-message`}>
                    {message.content}
                </p>
            </div>
        </div>
    );
}