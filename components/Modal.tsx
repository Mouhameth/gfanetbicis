import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import React, { useCallback } from 'react'
import { AiOutlineClose } from 'react-icons/ai'

interface ModalProps {
    isOpen?: boolean;
    onClose: () => void;
    title?: string;
    body?: React.ReactElement;
    actionLabel: string;
    disabled?: boolean;
}

const MyModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    body,
    disabled
}) => {
    const handleClose = useCallback(() => {
        if (disabled) {
            return;
        }
        onClose();
    }, [disabled, onClose]);

    if (!isOpen) return null;
    
    return (

        <div className=" lg:max-w-3xl my-12 mx-auto h-full lg:h-auto border-t-[4px] border-gray-300 rounded-lg shadow-2xl flex flex-col w-full bg-white">
            {disabled && <Box sx={{ width: '100%', margin: 'auto' }}>
                <LinearProgress color='secondary' className=' bg-white' />
            </Box>}
            {/* Header */}
            <div className=" flex items-center justify-center p-2  rounded-t text-blue">
                <h3 className="text-sm font-semibold  text-black">
                    {title}
                </h3>
                <button onClick={handleClose} className=' p-1 ml-auto border-0  text-black hover: opacity-70 transition'>
                    <AiOutlineClose size={16} />
                </button>
            </div>
            {/* body */}
            <div className=" p-10 flex-auto">
                {body}
            </div>

        </div>
    )
}

export default MyModal