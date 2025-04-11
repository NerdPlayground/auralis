import styles from "./styles.module.scss";

export default function Message({ content }){
    return(
        <div className={styles.message_container}>
            <p className={`${styles.message} ${styles[`${content.error?"error":"info"}_message`]}`}>
                {content.content}
            </p>
        </div>
    );
}
