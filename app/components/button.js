import { useTransition } from "react";
import Icon from "@/app/components/icons";
import { robotoCondensed } from "@/app/ui/fonts";

export default function Button({ icon, label, active, action, reaction, setMessage }){
    const [isPending, startTransition]=useTransition();
    const buttonClasses=[
        "button",
        robotoCondensed.className,
        `${active? "":"disabled-button"}`,
    ];

    return (
        <div className="button-container">
            <div>
                <Icon label={icon}/>
            </div>
            <button
                disabled={!active}
                className={buttonClasses.join(" ")}
                onClick={()=>{
                    startTransition(async ()=>{
                        const args=action?.arguments;
                        let response=(!args? 
                            await action.method():
                            await action.method(...args)
                        );
                        
                        if(!response.success){
                            setMessage({
                                status: true, error: true,
                                type: response?.type,
                                content: response.message
                            });
                            return;
                        }
                        
                        if(reaction) reaction(response);
                        setMessage({
                            content: "Success :)",
                            display: response?.display,
                            status: true, error: false,
                        });
                    });
                }}
            >{
                isPending? `Loading...` : label
            }</button>
        </div>
    );
}
