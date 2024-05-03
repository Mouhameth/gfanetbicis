import useAxiosAuth from "@/hooks/useAxiosAuth";

const fetcher = (url: string) => useAxiosAuth().get(url).then((res) => res.data);

export default fetcher;