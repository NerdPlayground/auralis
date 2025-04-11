"use client";
import { useState } from "react";
import Auth from "@/app/authorize/component";
import Button from "@/app/components/button/component";
import { useLocalStorage } from "@/app/lib/hooks";
import { getCurrentlyPlaying } from "@/app/lib/actions";
import Display from "@/app/display/component";
import Message from "@/app/components/message/component";

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
            icon:"playing",
            label: "Get Currently Playing",
            method: getCurrentlyPlaying,
            arguments: [access_token],
        },
    ]);

    return (
        <div id="platform">
            <Display message={message}/>
            <div id="container">
                <div>
                    <Auth
                        item={item}
                        message={message}
                        setMessage={setMessage}
                        refresh_token={refresh_token}
                    />
                </div>
                <div>{
                    menuItems.map(menuItem=>{return (
                        <Button
                            icon={menuItem.icon}
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
                <Message content={message}/>
            </div>
        </div>
    );
}
