import { useRouter, usePathname } from "next/navigation";
import React, { useCallback } from "react";
import { IconType } from "react-icons";
import { BsDot } from "react-icons/bs";
import {AiFillCheckCircle} from "react-icons/ai";

interface SidebarItemProps {
 label: string;
 href?: string;
 icon: IconType;
 onClick?: () => void;
 auth?: boolean;
}
 

const SidebarItem: React.FC<SidebarItemProps> = ({
    label,
    href,
    icon: Icon,
    onClick
}) => {

  const router = useRouter();

  const pathName = usePathname();

  const handleClick = useCallback(()=>{
 
    if(onClick){
        return onClick();
    }
    else if(href){
        router.push(href);
    }
  },[router, onClick, href])  
  return (
    <div onClick={handleClick } className={`flex flex-row items-center  hover:text-white hover:bg-gray-200 mx-4 hover:rounded-md ${href == pathName ? ` bg-black rounded-md text-white`: `text-black`}`}>

    
        <div className="
            relative
            rounded-full 
            h-8
            w-8
            flex 
            items-center 
            justify-center
            p-4 
            hover:bg-orange-400
            cursor-pointer
            lg:hidden">
            <Icon size={18} color="black" />  
              
        </div>

        <div className="
               relative 
               hidden 
               lg:flex
               gap-4 
               py-4 
               px-8
               rounded-full 
               cursor-pointer 
               hover:text-white
               items-center">
            <Icon size={20}  />   
            <p className="hidden lg:block text-xs">
                {label}
            </p> 
            
        </div>
    </div>
  )
}

export default SidebarItem