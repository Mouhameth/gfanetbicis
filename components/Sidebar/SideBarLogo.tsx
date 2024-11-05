import { BsTwitter } from "react-icons/bs"
import logo from "@/assets/applogo.png"
import Image from "next/image"

const SidebarLogo = () => {


  return (
    <div className="
    h-40
    w-40
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