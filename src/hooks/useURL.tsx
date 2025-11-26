// src/hooks/useEmpleados.ts
import { useEffect, useState } from "react";
import { getURLs } from "../services/URLs";
import { ArrayURL } from "../types/Url";

export const useURL = (id: number | undefined) => {
    const [urls, setUrls] = useState<ArrayURL>([])
    const [isLoadingURL, setIsLoadingURL] = useState(false)
    useEffect(() => {
        const fetchURLS = async () => {
            setIsLoadingURL(true);
            const data = await getURLs({ id });
            setUrls(data.data);
            setIsLoadingURL(false);
        };
        if(id){
            fetchURLS();
        }
        
    }, [id]);
    return { urls, isLoadingURL };
};
