"use client";
import { useState } from "react";
import Display from "@/app/display/component";
import Container from "@/app/container/component";

export default function Root(){
    const initialState=Object.freeze({
        status: false,
        type: null,
        error: false,
        content: "-_-",
    });
    const [message, setMessage]=useState(initialState);

    return (
        <div id="platform">
            <Display message={message}/>
            <Container
                message={message}
                setMessage={setMessage}
            />
        </div>
    );
}
