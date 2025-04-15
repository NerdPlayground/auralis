import { useLocalStorage } from "@/app/lib/hooks";
import { getCurrentlyPlaying } from "@/app/lib/actions";
import styles from "./styles.module.scss";
import Auth from "@/app/authorize/component";
import Button from "@/app/components/button/component";
import Message from "@/app/components/message/component";

export default function Container({ message,setMessage,setDisplay,setResults }){
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

    return(
        <div className={styles.container}>
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
                        setDisplay={setDisplay}
                        setResults={setResults}
                        active={item && !message.error}
                    />
                );})
            }</div>
            <Message content={message}/>
        </div>
    );
}
