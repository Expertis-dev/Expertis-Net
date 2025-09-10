// src/hooks/useEmpleados.ts
import { useEffect, useState } from "react";
import { getURLs } from "../services/URLs";
import { ArrayURL } from "../types/Url";

export const useURL = (id: number | undefined) => {
    const [urls, setUrls] = useState<ArrayURL>([])
    const [isloadingURL, setIsloadingURL] = useState(false)
    useEffect(() => {
        const fetchURLS = async () => {
            setIsloadingURL(true);
            const data = await getURLs({ id });
            setUrls(data.data);
            setIsloadingURL(false);
        };
        if(id){
            fetchURLS();
        }
        
    }, [id]);
    return { urls, isloadingURL };
};
