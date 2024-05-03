import { RxDashboard } from "react-icons/rx";
import SidebarLogo from "./SideBarLogo";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { LuSettings } from "react-icons/lu";
import { useSession } from "next-auth/react";
import SidebarItem from "./SideBarItem";
import { BsBuildingsFill, BsPersonCircle } from "react-icons/bs";
import { MdPermMedia } from "react-icons/md";
import { PiComputerTower } from "react-icons/pi";
import { RiCustomerService2Line } from "react-icons/ri";

const rootItems = [
    {
        label: "Dashboard",
        href: "/home",
        icon: RxDashboard
    },
    {
        label: "Utilisateurs",
        href: "/home/admins",
        icon: HiOutlineUserGroup,
        auth: true
    },
    {
        label: "Paramètre",
        href: "/home/settings",
        icon: LuSettings,
        auth: true
    }
];

const adminItems = [
    {
        label: "Dashboard",
        href: "/home",
        icon: RxDashboard
    },{
        label: "Paramètre",
        href: "/home/settings",
        icon: LuSettings,
        auth: true
    }
]


const SideBar = () => {
    const { data: session, status } = useSession();

    return (
        <div className=' bg-white h-screen flex flex-col justify-between'>
            <div>
                <SidebarLogo />
                <div>
                    {session?.user.role.name == "root" && rootItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                            auth={item.auth}
                        />
                    ))}
                    {session?.user.role.name == "admin" && adminItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                            auth={item.auth}
                        />
                    ))}
                </div>
            </div>
            <div className=" px-4 pb-6">
                <hr className=" mb-4" />
                <div className=" flex justify-center items-center gap-2">
                    <BsPersonCircle size={32} className=" text-black" />
                    <div>
                        <p className=" text-xs font-semibold">{session?.user.name}</p>
                        {session?.user.role.name.toLowerCase() === "root" &&<p className=" text-xs">Super administrateur</p>}
                        {session?.user.role.name.toLowerCase() === "admin" &&<p className=" text-xs">Manager</p>}
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideBar