"use client";

import { getTimeFormServer } from "@/actions/escucha";
import { useEffect, useState } from "react";

interface Props {
    className?: string
}

export const TimeComponent = ({className}: Props) => {

    const [time, setTime] = useState<string>()

    useEffect(() => {
        const intervalId = setInterval(async () => {
            setTime(await getTimeFormServer())
        }, 1000);
        return () => clearInterval(intervalId);
    }, [setTime]);

    return (
        <p className={`${className}`}>
            {time?.toLocaleString().split(" ")[0]}
        </p>
    );
};
