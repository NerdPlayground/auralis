import { useCallback, useEffect, useState } from "react";

export function useDot(emblaApi){
    const [selectedIndex, setSelectedIndex]=useState(0);
    const [scrollSnaps, setScrollSnaps]=useState([]);

    const onDotClick=useCallback(
        (index)=>{
            if (!emblaApi) return;
            emblaApi.scrollTo(index);
        },
        [emblaApi]
    );

    const onInit = useCallback((emblaApi)=>{
        setScrollSnaps(emblaApi.scrollSnapList());
    },[]);
    
    const onSelect = useCallback((emblaApi)=>{
        setSelectedIndex(emblaApi.selectedScrollSnap());
    },[]);

    useEffect(()=>{
        if (!emblaApi) return;
        onInit(emblaApi);
        onSelect(emblaApi);

        emblaApi
        .on('reInit', onInit)
        .on('reInit', onSelect)
        .on('select', onSelect);

    },[emblaApi, onInit, onSelect]);

    return{
        selectedIndex,
        scrollSnaps,
        onDotClick
    };
}

export function Dot(props){
  const {children,...restProps}=props;
  return <div {...restProps}>{children}</div>;
}
