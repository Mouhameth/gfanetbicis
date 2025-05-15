import { RxDashboard } from "react-icons/rx";
import SidebarLogo from "./SideBarLogo";
import { HiBellAlert, HiOutlineUserGroup } from "react-icons/hi2";
import { LuSettings } from "react-icons/lu";
import { useSession } from "next-auth/react";
import SidebarItem from "./SideBarItem";
import { BsCurrencyExchange, BsPersonCircle } from "react-icons/bs";
import { MdPermMedia } from "react-icons/md";
import { PiBuildingsFill } from "react-icons/pi";
import { TbReportAnalytics } from "react-icons/tb";

const rootItems = [
    {
        label: "Dashboard Par Agence",
        href: "/home",
        icon: RxDashboard
    },
    {
        label: "Dashboard Général",
        href: "/home/report",
        icon: TbReportAnalytics
    },
    {
        label: "Agences",
        href: "/home/offices",
        icon: PiBuildingsFill
    },
    {
        label: "Utilisateurs",
        href: "/home/admins",
        icon: HiOutlineUserGroup,
        auth: true
    },
    {
        label: "Multimédias",
        href: "/home/medias",
        icon: MdPermMedia,
        auth: true
    },
    {
        label: "Devis",
        href: "/home/devis",
        icon: BsCurrencyExchange
    },
    {
        label: "Alertes",
        href: "/home/alert",
        icon: HiBellAlert
    },
    {
        label: "Paramètre",
        href: "/home/settings",
        icon: LuSettings,
        auth: true
    }
];

const adminOfficeItems = [
    {
        label: "Dashboard",
        href: "/office",
        icon: RxDashboard
    },{
        label: "Paramètre",
        href: "/office/settings",
        icon: LuSettings,
        auth: true
    }
]

const adminItems = [
    {
        label: "Dashboard Par Agence",
        href: "/home",
        icon: RxDashboard
    },
    {
        label: "Dashboard Général",
        href: "/home/report",
        icon: TbReportAnalytics
    },
    {
        label: "Agences",
        href: "/home/offices",
        icon: PiBuildingsFill
    },
    {
        label: "Multimédias",
        href: "/home/medias",
        icon: MdPermMedia,
        auth: true
    },
    {
        label: "Devis",
        href: "/home/devis",
        icon: BsCurrencyExchange
    },
    {
        label: "Alertes",
        href: "/home/alert",
        icon: HiBellAlert
    },
    {
        label: "Paramètre",
        href: "/home/settings",
        icon: LuSettings,
        auth: true
    }
]

const marketingItems = [
    {
        label: "Dashboard Par Agence",
        href: "/home",
        icon: RxDashboard
    },
    {
        label: "Dashboard Général",
        href: "/home/report",
        icon: TbReportAnalytics
    },
    {
        label: "Agences",
        href: "/home/offices",
        icon: PiBuildingsFill
    },
    {
        label: "Multimédias",
        href: "/home/medias",
        icon: MdPermMedia,
        auth: true
    },
    {
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
                    {session?.user.role.name == "root" && (!session?.user.officeId || session?.user.officeId ===0) && rootItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                            auth={item.auth}
                        />
                    ))}
                    {session?.user.role.name == "admin" && (!session?.user.officeId || session?.user.officeId ===0) && adminItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                            auth={item.auth}
                        />
                    ))}
                    {session?.user.role.name == "marketing" && marketingItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                            auth={item.auth}
                        />
                    ))}
                    {session?.user.role.name === "admin" && session?.user.officeId && session?.user.officeId !==0 && adminOfficeItems.map((item) => (
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
                <div className=" flex justify-start items-center gap-2">
                    <BsPersonCircle size={32} className=" text-black" />
                    <div>
                        <p className=" text-xs font-semibold">{session?.user.name}</p>
                        {session?.user.role.name.toLowerCase() === "root" &&<p className=" text-xs">Super administrateur</p>}
                        {session?.user.role.name.toLowerCase() === "admin" &&<p className=" text-xs">Manager</p>}
                        {session?.user.role.name.toLowerCase() === "marketing" &&<p className=" text-xs">Marketing et Communication</p>}
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideBar