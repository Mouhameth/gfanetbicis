import { BsTwitter } from "react-icons/bs"
import bank from "@/assets/bank.jpg"
import Image from "next/image"

const SidebarLogo = () => {


  return (
    <div className="
    h-36
    w-36
    p-4
    mx-auto
    cursor-pointer
    transition
    ">
      <Image src={bank} alt={""} />
    </div>
  )
}

export default SidebarLogo