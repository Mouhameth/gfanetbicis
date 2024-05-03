import fetcher from "@/libs/fetcher";
import useSWR from "swr"

const useAdmins = () =>{
    const url = `/user/admin/all`;
    const {data, error, isLoading, mutate} = useSWR(url, fetcher);

    return {
        data,
        error,
        isLoading,
        mutate
    }
};

export default useAdmins;