"use client";

import { axiosAuth } from "@/libs/axios";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const useAxiosAuth = ()=>{
    const {data: session} = useSession();

    useEffect(() =>{
        const requestIntercept = axiosAuth.interceptors.request.use((config) =>{
                if(!config.headers["Authorization"]){
                    config.headers["Authorization"] = `Bearer ${session?.tokens.accessToken}`;
                }
                return config;
            });
            
        return () => {
            axiosAuth.interceptors.request.eject(requestIntercept);
        }    
    }, [session]);

    return axiosAuth;
}

export default useAxiosAuth;