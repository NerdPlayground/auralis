import "@/app/ui/styles.scss";

export const metadata = {
    title: "Spotify",
    description: "Some fun with Spotify code",
};
  
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}