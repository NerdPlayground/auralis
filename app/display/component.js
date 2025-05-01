import Image from "next/image";
import { useEffect, useRef } from "react";
import { anton, robotoCondensed } from "@/app/ui/fonts";
import Link from "next/link";

function Details({ display,display_name }){
    const name_container=useRef(null);
    const name_marquee=useRef(null);
    const artists_container=useRef(null);
    const artists_marquee=useRef(null);

    useEffect(()=>{
        function startAnimation(animation,parent,child){
            const SPEED=18;
            const parent_width=getComputedStyle(parent).width;
            const child_width=getComputedStyle(child).width;
            let difference=+parent_width.slice(0,-2)-+child_width.slice(0,-2);

            let cover_styles=null;
            if(difference<0){
                cover_styles=document.createElement("style");
                cover_styles.setAttribute("type","text/css");
                cover_styles.innerHTML=`
                @keyframes ${animation}{
                    0%{ transform: translateX(0); }
                    100%{ transform: translateX(calc(${parent_width} - ${child_width})); }
                }`;
                document.head.appendChild(cover_styles);
                const time=Math.ceil((difference*-1)/SPEED);
                child.style.animation=`${animation} ${time}s linear infinite alternate`;
            }
            return cover_styles;
        }

        let name_styles=startAnimation(
            "name_marquee",name_container.current,name_marquee.current
        );
        let artist_styles=startAnimation(
            "artists_marquee",artists_container.current,artists_marquee.current
        );
        return(()=>{
            if(name_styles!==null) document.head.removeChild(name_styles);
            if(artist_styles!==null) document.head.removeChild(artist_styles);
        });
    },[display]);

    return(
        <div>
            <div className={`${anton.className}`} ref={name_container}>
                <div ref={name_marquee}>{
                    !display? `Welcome To Auralis`:
                    !display?.name? `Nothing Is Playing`:(
                        <Link href={display.name.url} target="_blank">
                            {display.name.label}
                        </Link>
                    )
                }</div>
            </div>
            <div className={`${robotoCondensed.className}`} ref={artists_container}>
                <div ref={artists_marquee}>{
                    !display?`${display_name ?? "Fellow Listener"}`:
                    !display?.artists? `No Artists`:(
                        display.artists.map((artist,index,array)=>(
                            <Link key={index} href={artist.url} target="_blank">
                                {`${artist.label}${index===array.length-1?"":","}`}
                            </Link>
                        ))
                    )
                }</div>
            </div>
        </div>
    );
}

function Controls({ setDisplay,index,setIndex,results }){
    function changeDisplay(direction){
        let nextIndex=index+direction;
        if(nextIndex>=0 && nextIndex<results.length){
            setIndex(nextIndex);
            setDisplay(results[nextIndex]);                                
        }
    }

    return(
        <div>
            <div onClick={results?()=>changeDisplay(-1):null}>
                <svg 
                    viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                    className={`${results?"":"disabled-button"}`}
                >
                    <path d="M5 15h14l-7-8-7 8Z"></path>
                </svg>
            </div>
            <div onClick={results?()=>changeDisplay(1):null}>
                <svg 
                    viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                    className={`${results?"":"disabled-button"}`}
                >
                    <path d="m11.998 17 7-8h-14l7 8Z"></path>
                </svg>
            </div>
        </div>
    );
}

export default function Display({ 
    display_name,display,
    setDisplay,index,setIndex,results
}){
    const dimension=300;
    return(
        <div id="display">
            <Image
                alt="Cover Image" 
                priority={true}
                width={dimension} height={dimension}
                src={
                    !display?"/default.png":
                    display?.cover? display.cover:"/nothing.png"
                }
            />
            <div>
                <Details
                    display={display}
                    display_name={display_name}
                />
                <Controls
                    setDisplay={setDisplay}
                    index={index}
                    setIndex={setIndex}
                    results={results}
                />
            </div>
        </div>
    );
}
