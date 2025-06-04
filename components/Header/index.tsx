import React from 'react'
import { IoIosArrowDropleft } from "react-icons/io";
import { LiaCopyrightSolid } from "react-icons/lia";
import { CiLogout } from "react-icons/ci";
import { Tooltip } from '@mui/material';
import useChangeHeaderTitle from '@/app/hooks/useChangedHeader';
import { signOut } from 'next-auth/react';

const Header = () => {
    const useChangeTitle = useChangeHeaderTitle();
    const signOutUser = () => {
        signOut();
    }
    return (
        <div className='sticky top-0 z-999 w-full bg-white py-4 px-4 flex justify-between items-center'>
            <div className=' flex items-end gap-2'>
                <div className=' flex items-center justify-center gap-1'>
                    <LiaCopyrightSolid size={18} className=" text-gray-400" />
                    {/* <h2>{useChangeTitle.title}</h2> */}
                    <p className=' text-[12px] text-gray-500'>
                        (Gfanet <span className=' font-semibold'>B</span> by gigaelectronic.net)
                    </p>

                </div>
                {/* <p className=' text-[12px] text-gray-500'>
                    (Gfanet <span className=' font-semibold'>B</span> by gigaelectronic.net)
                </p> */}
            </div>

            <div className=' flex justify-center items-center'>
                <Tooltip title="Déconnexion" className=' text-sm'>
                    <div onClick={signOutUser} className=" w-7 h-7 border rounded-full border-gray-400 flex justify-center items-center cursor-pointer hover:text-red-500 hover:border-red-500 transition">
                        <CiLogout size={16} />
                    </div>
                </Tooltip>
            </div>
        </div>
    )
}

export default Header