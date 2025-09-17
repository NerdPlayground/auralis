import Image from "next/image";
import styles from "./styles.module.scss";

export default function Message({ content }){
    return(
        <div className={styles.message_container}>
            <p className={`${styles.message} ${styles[`${content.error?"error":"info"}_message`]}`}>
                {content.content}
            </p>
            <div>
                <Image
                    src="/spotify.png"
                    width={50} height={50}
                    alt="Official Green Spotify Logo"
                />
            </div>
        </div>
    );
}
