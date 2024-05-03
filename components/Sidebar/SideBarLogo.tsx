import { BsTwitter } from "react-icons/bs"
import logo from "@/assets/applogo.png"
import Image from "next/image"

const SidebarLogo = () => {


  return (
    <div className="
    h-24
    w-24
    p-4
    mx-auto
    cursor-pointer
    transition
    ">
      <Image src={logo} alt={""} />
    </div>
  )
}

export default SidebarLogo