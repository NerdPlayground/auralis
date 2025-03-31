"use client";
import { useEffect, useRef, useState } from "react";
import Auth from "@/app/authorize/component";
import Button from "@/app/components/button";
import { useLocalStorage } from "@/app/lib/hooks";
import { getCurrentlyPlaying } from "@/app/lib/actions";
import Image from "next/image";
import { anton, robotoCondensed } from "./ui/fonts";

export default function Root(){
    const name_container=useRef(null);
    const name_marquee=useRef(null);
    const artists_container=useRef(null);
    const artists_marquee=useRef(null);

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

    useEffect(()=>{
        function startAnimation(parent,child){
            const SPEED=18;
            const parent_width=getComputedStyle(parent).width;
            const child_width=getComputedStyle(child).width;
            let difference=+parent_width.slice(0,-2)-+child_width.slice(0,-2);

            if(difference<0){
                let cover_styles=document.createElement("style");
                cover_styles.setAttribute("type","text/css");
                cover_styles.innerHTML=`
                @keyframes scroll{
                    0%{ transform: translateX(0); }
                    100%{ transform: translateX(calc(${parent_width} - ${child_width})); }
                }`;
                document.head.appendChild(cover_styles);
                const time=Math.ceil((difference*-1)/SPEED);
                child.style.animation=`scroll ${time}s linear infinite alternate`;
            }
        }
        startAnimation(name_container.current,name_marquee.current);
        startAnimation(artists_container.current,artists_marquee.current);
    })

    return (
        <div id="platform">
            <div id="display">
                <Image
                    alt="Cover Image" width={300} height={300}
                    src={
                        message?.display?.cover? 
                        message.display.cover:"/default.png"
                    }
                />
                <div>
                    <div>
                        <div className={`${anton.className}`} ref={name_container}>
                            <div ref={name_marquee}>
                                {message?.display?.name?
                                message.display.name:`Welcome To Lotify`}
                            </div>
                        </div>
                        <div className={`${robotoCondensed.className}`} ref={artists_container}>
                            <div ref={artists_marquee}>
                                {message?.display?.artists?
                                message.display.artists:`Fellow Listener`}
                            </div>
                        </div>
                    </div>
                    <div>
                        <svg 
                            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                            className={`${message?.displays?"":"disabled-button"}`}
                        >
                            <path d="M5 15h14l-7-8-7 8Z"></path>
                        </svg>
                        <svg 
                            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                            className={`${message?.displays?"":"disabled-button"}`}
                        >
                            <path d="m11.998 17 7-8h-14l7 8Z"></path>
                        </svg>
                    </div>
                </div>
            </div>
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
        </div>
    );
}