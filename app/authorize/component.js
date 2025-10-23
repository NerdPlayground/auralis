"use client";
import Button from "@/app/components/button/component";
import { robotoCondensed } from "@/app/ui/fonts";
import { getUserProfile, handleAuthorization, handleEncryption, refreshAccessToken, joinAuralis } from "@/app/lib/actions";

export default function Auth({ 
    item,user_details,registered_email,auralis_member,
    message,setMessage,access_token,refresh_token
}){
    return (
        (!auralis_member)?(
            <Button
                icon={"join"}
                active={true}
                label={"Join Others On Auralis"}
                action={{
                    method: joinAuralis,
                    arguments: [registered_email],
                }}
                setMessage={setMessage}
                reaction={async()=>{
                    localStorage.setItem(
                        "auralis-member",
                        await handleEncryption({details:true})
                    );
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                    window.location.reload();
                }}
            />
        ):
        (!item || (message.error && message.type==="400" && message.segment==="0"))?(
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
                reaction={async (response)=>{
                    const { access_token, refresh_token, expires_in }=response;
                    localStorage.setItem(
                        "spotify-package",
                        await handleEncryption({
                            details:`${access_token} | ${refresh_token} | ${expires_in}`
                        })
                    );
                    window.location.reload();
                }}
            />
        ):
        (!user_details)?(
            <Button
                icon={"question"}
                active={true}
                label={`Retrieve Your Information`}
                action={{
                    method: getUserProfile,
                    arguments: [access_token],
                }}
                setMessage={setMessage}
                reaction={async (response)=>{
                    const {user_id , display_name, user_email}=response;
                    localStorage.setItem(
                        "spotify-user",
                        await handleEncryption({
                            details:`${user_id} | ${user_email} | ${display_name}`
                        })
                    );
                    window.location.reload();
                }}
            />
        ):
        (
            <Button
                button={false}
                icon={`${message.error?"thumbs-down":"thumbs-up"}`}
                element={(
                    <p className={`${robotoCondensed.className}`}>
                        {`${message.error?"Oh no, Something Went Wrong!!!":"You Are All Set, Have Fun!!!"}`}
                    </p>
                )}
            />
        )
    );
}
