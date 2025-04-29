import styles from "./styles.module.scss";
import Auth from "@/app/authorize/component";
import Message from "@/app/components/message/component";
import { Dot, useDot } from "./dots";
import Button from "@/app/components/button/component";
import useEmblaCarousel from "embla-carousel-react";
import { addTopTracks, getCurrentlyPlaying, getTopTracks } from "@/app/lib/actions";

export default function Container({ 
    item,user_details,user_id,access_token,refresh_token,
    message,setMessage,results,setResults,setDisplay
}){
    const [emblaRef,emblaApi]=useEmblaCarousel({});
    const {selectedIndex,scrollSnaps,onDotClick}=useDot(emblaApi);

    let menuItems=[
        {
            icon:"playing",
            label: "Get Currently Playing",
            method: getCurrentlyPlaying,
            arguments: [access_token],
        },
        {
            icon:"top",
            label: "Get Your Top Tracks",
            method: getTopTracks,
            arguments: [access_token],
        },
    ];

    if(results) menuItems[1]={
        icon:"new",
        label: "Create Top Tracks Playlist",
        method: addTopTracks,
        arguments: [access_token,user_id,results],
    };

    return(
        <div className={styles.container}>
            <div>
                <Auth
                    item={item}
                    user_details={user_details}
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
                            classes={styles.embla__slide}
                            icon={menuItem.icon}
                            key={menuItem.label}
                            label={menuItem.label}
                            action={{
                                method: menuItem.method,
                                arguments: [...menuItem.arguments],
                            }}
                            setMessage={setMessage}
                            setDisplay={setDisplay}
                            setResults={setResults}
                            active={item && user_details && !message.error}
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
