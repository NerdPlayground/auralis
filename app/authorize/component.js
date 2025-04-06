"use client";
import { redirect } from "next/navigation";
import Button from "@/app/components/button";
import { robotoCondensed } from "@/app/ui/fonts";
import Icon from "@/app/components/icons";
import { handleAuthorization, refreshAccessToken } from "@/app/lib/actions";

export default function Auth({ item, message, setMessage, refresh_token }){
    return (
        (item==="" || (message.error && message.type==="400"))?(
            <Button
                icon={"print"}
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
                icon={"refresh"}
                active={true}
                label={`Refresh Access Token`}
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
                    redirect("/");
                }}
            />
        ):
        (
            <div className="button-container">
                <div>
                    <Icon label={"thumbs-up"}/>
                </div>
                <p className={`${robotoCondensed.className} label`}>
                    {`${message.error?"Oh no":"Enjoy"}`}
                </p>
            </div>
        )
    );
}
