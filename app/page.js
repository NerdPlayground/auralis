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
    const [display, setDisplay]=useState(null);
    const [results, setResults]=useState(null);
    const [index, setIndex]=useState(0);

    return (
        <div id="platform">
            <Display
                index={index}
                setIndex={setIndex}
                display={display}
                setDisplay={setDisplay}
                results={results}
            />
            <Container
                message={message}
                setMessage={setMessage}
                setDisplay={setDisplay}
                setResults={setResults}
            />
        </div>
    );
}
