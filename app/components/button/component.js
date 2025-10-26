import { useTransition } from "react";
import Icon from "@/app/components/icons";
import styles from "./styles.module.scss";
import { robotoCondensed } from "@/app/ui/fonts";

export default function Button({ 
    icon, label, active, action, reaction, 
    setMessage, setDisplay, setResults, 
    button=true, element=null, classes={}
}){
    const [isPending, startTransition]=useTransition();
    const buttonClasses=[
        "button",
        robotoCondensed.className,
        `${active? "":"disabled-button"}`,
    ];

    return (
        <div className={`${styles.button_container} ${classes?.container}`}>
            <div className={`${classes?.icon}`}>
                <Icon label={icon}/>
            </div>
            {!button?element:
            <button
                disabled={!active}
                className={buttonClasses.join(" ")}
                onClick={()=>{
                    startTransition(async ()=>{
                        const args=action?.arguments;
                        let response=null;
                        if(action?.method) response=(!args? 
                            await action.method():
                            await action.method(...args)
                        );
                        
                        if(response?.success===false){
                            setMessage({
                                status: true, error: true,
                                type: response?.type,
                                segment: response?.segment,
                                content: response?.message
                            });
                            return;
                        }
                        
                        if(reaction) reaction(response);
                        setMessage({
                            content: `${response?.message ?? "••• Success •••"}`,
                            status: true, error: false,
                        });
                        
                        if(response?.results){
                            setResults({
                                sample: response.sample,
                                results: response.results,
                            });
                            setDisplay(response.sample[0]);
                        }
                        else if(response?.display)
                            setDisplay(response.display);
                    });
                }}
            >{
                isPending? `Loading...` : label
            }</button>}
        </div>
    );
}
