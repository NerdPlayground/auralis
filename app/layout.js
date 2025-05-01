import "@/app/ui/styles.scss";

export const metadata = {
    title: "Auralis",
    description: "Let's have fun with your Spotify account",
};
  
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    );
}