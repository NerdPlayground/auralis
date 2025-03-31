import { Anton, Roboto_Condensed } from "next/font/google";

export const robotoCondensed=Roboto_Condensed({
    weight:"400",
    display: "swap",
    subsets:["latin"],
    fallback:["monospace"],
});

export const anton=Anton({
    weight:"400",
    display: "swap",
    subsets:["latin"],
    fallback:["monospace"],
});
