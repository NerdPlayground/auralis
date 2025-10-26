"use client";
import styles from "./styles.module.scss";
import Auth from "@/app/authorize/component";
import Message from "@/app/components/message/component";
import { Dot, useDot } from "./dots";
import Button from "@/app/components/button/component";
import useEmblaCarousel from "embla-carousel-react";
import { 
    addTopTracks, getCurrentlyPlaying, getTopTracks, removeEmail, updateTopTracks 
} from "@/app/lib/actions";
import { useState } from "react";

export default function Container({ 
    item,user_details,user_id,auralis_member,access_token,
    refresh_token,message,setMessage,results,playlist_id,setResults,setDisplay
}){
    const [user_email,setEmail]=useState("");
    const [emblaRef,emblaApi]=useEmblaCarousel({});
    const {selectedIndex,scrollSnaps,onDotClick}=useDot(emblaApi);

    function changeInput(event){
        setEmail(event.target.value);
    }

    let menuItems=[
        {
            icon: "send",
            label: "jdoe@email.com",
            button: false,
            active: true,
            element: (
                <input 
                    type="email" name="email" id="email" 
                    placeholder="Enter Your Spotify Email" 
                    value={user_email} onChange={changeInput}
                />
            ),
        },
        {
            icon: "playing",
            label: "Get Currently Playing",
            action: {
                method: getCurrentlyPlaying,
                arguments: [access_token],
            },
        },
        {
            icon: "top",
            label: "Get Your Top Tracks",
            action: {
                method: getTopTracks,
                arguments: [access_token],
            },
        },
        {
            icon: "delete",
            label: "Remove Your Email",
            active: true,
            action: {
                method: removeEmail,
            },
            reaction: async()=>{
                localStorage.removeItem("auralis-member");
                await new Promise((resolve) => setTimeout(resolve, 3000));
                window.location.reload();
            },
        },
    ];

    if(auralis_member) menuItems.shift();
    else menuItems.pop();

    if(results){
        menuItems[1]=playlist_id?{
            icon: "update",
            label: "Update Top Tracks Playlist",
            action:{
                method: updateTopTracks,
                arguments: [access_token,playlist_id,results],
            },
        }:{
            icon: "new",
            label: "Create Top Tracks Playlist",
            action:{
                method: addTopTracks,
                arguments: [access_token,user_id,results],
            },
        };
    }

    const active=item && user_details && auralis_member && !message.error;

    return(
        <div className={styles.container}>
            <div>
                <Auth
                    item={item}
                    user_details={user_details}
                    registered_email={user_email}
                    auralis_member={auralis_member}
                    message={message}
                    setMessage={setMessage}
                    access_token={access_token}
                    refresh_token={refresh_token}
                />
            </div>
            <div className={styles.embla__viewport} ref={emblaRef}>
                <div className={styles.embla__container}>{
                    menuItems.map(menuItem=>(
                        <Button
                            icon={menuItem?.icon}
                            key={menuItem?.label}
                            label={menuItem?.label}
                            button={menuItem?.button}
                            element={menuItem?.element}
                            action={menuItem?.action}
                            reaction={menuItem?.reaction}
                            setMessage={setMessage}
                            setDisplay={setDisplay}
                            setResults={setResults}
                            active={menuItem?.active ?? active}
                            classes={{
                                icon: `${menuItem?.active ?? active?"":"grey"}`,
                                container: styles.embla__slide,
                            }}
                        />
                    ))
                }</div>
            </div>
            {menuItems.length>1 &&
            <div className={styles.embla__dots}>{
                scrollSnaps.map((_,index)=>(
                    <Dot
                        key={index}
                        onClick={() => onDotClick(index)}
                        className={`${styles.embla__dot} 
                        ${index===selectedIndex?styles.embla__selected:''}`}
                    />
                ))
            }</div>}
            <Message content={message}/>
        </div>
    );
}
