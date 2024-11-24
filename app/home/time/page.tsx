"use client";
import useChangeHeaderTitle from '@/app/hooks/useChangedHeader';
import Loader from '@/components/common/Loader';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import { Slider } from '@mui/material';
import Modal from '@mui/material/Modal'
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit3 } from 'react-icons/fi';
import { IoAddCircleOutline } from 'react-icons/io5';
import useSWR from 'swr';

const Time = () => {
    const [openEditTime, setOpenEditTime] = useState(false);
    const [openTime, setOpenTime] = useState(false);

    const time: Time = {
        id: 0,
        createdAt: new Date(),
        time: 0,
        type: '',
        updatedAt: new Date()
    };
    const [timeToUpdate, setTimeToUpdate] = useState(time);
    const url = `/time`;
    const axiosAuth = useAxiosAuth();
    const [loading, setLoading] = useState(false);
    const { data: fetchedTimes, isLoading, error, mutate } = useSWR(url, () => axiosAuth.get<Time[]>(url).then((res) => res.data));
    const useChangeTitle = useChangeHeaderTitle();
    useEffect(() => {
        useChangeTitle.onChanged("Paramètrage des temps");
    }, []);

    const submitTime = async () => {
        try {
            setLoading(true);
            const res = await axiosAuth.post(url, JSON.stringify({ 'time': value, 'type': type }));
            if (res.status == 201) {
                toast.success('Opération réussie!', { duration: 3000, className: " text-xs" });
                mutate();
                handleCloseTime();
            }
        }
        catch (error: any) {
            console.log(error);

            toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
        }
        finally {
            setLoading(false);
        }
    }

    const updateTime = async () => {
        try {
          setLoading(true);
          const res = await axiosAuth.put(url, JSON.stringify({ 'id': timeToUpdate.id, 'time': value }));
          if (res.status == 200) {
            toast.success('Opération réussie!', { duration: 3000, className: " text-xs" });
            mutate();
            handleCloseEditTime();
          }
        }
        catch (error: any) {
          console.log(error);

          toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
        }
        finally {
          setLoading(false);
        }
    }

    const [value, setValue] = useState(0);
    const [type, setType] = useState('');

    const handleChange = (event: Event, newValue: number | number[]) => {

        if (typeof newValue === 'number') {
            setValue(newValue);
        }
    };



    const handleOpenEditTime = (time: Time) => {
        setTimeToUpdate(time);
        setValue(time.time);
        setOpenEditTime(true);
    };

    const handleOpenTime = (type: string) => {
        setType(type)
        setOpenTime(true);
    };

    const handleCloseTime = () => {
        setOpenTime(false);
    };

    const handleCloseEditTime = () => {
        setOpenEditTime(false);
    };

    if (isLoading || loading) {
        return <Loader />
    }


    return (
        <div className=' bg-slate-100 h-screen  w-full rounded-t-xl p-4 overflow-auto'>
            {
                fetchedTimes && fetchedTimes.map((time) => (
                    <>
                        {
                            time.type === "meanWaitingTime" &&
                            <div className=' my-8'>
                                <p className=' text-sm font-semibold my-2'>Temps moyen d&apos;attente</p>
                                <div className="flex gap-3 items-center">
                                    <p className=' text-xs'>Durée : {time.time} minutes</p>
                                    <FiEdit3 size={16} onClick={() => handleOpenEditTime(time)} className=" cursor-pointer hover:text-blue-500" />
                                </div>
                            </div>
                        }
                        {
                            time.type === "meanServingTime" &&
                            <div className=' my-8'>
                                <p className=' text-sm font-semibold my-2'>Temps moyen de traitement</p>
                                <div className="flex gap-3 items-center">
                                <p className=' text-xs'>Durée : {time.time} minutes</p>
                                    <FiEdit3 size={16} onClick={() => handleOpenEditTime(time)} className=" cursor-pointer hover:text-blue-500" />
                                </div>
                            </div>
                        }
                        {
                            time.type === "minimalServingTime" &&
                            <div className=' my-8'>
                                <p className=' text-sm font-semibold my-2'>Temps minimal de traitement</p>
                                <div className="flex gap-3 items-center">
                                <p className=' text-xs'>Durée : {time.time} minutes</p>
                                    <FiEdit3 size={16} onClick={() => handleOpenEditTime(time)} className=" cursor-pointer hover:text-blue-500" />
                                </div>
                            </div>
                        }
                    </>
                ))
            }
            {fetchedTimes && fetchedTimes.length == 0 && <button onClick={() => handleOpenTime("meanWaitingTime")} className='  bg-black py-2 px-4 rounded-md text-white text-sm flex items-center gap-2 my-4 '><IoAddCircleOutline size={20} /> Ajouter Le temps moyen d&apos;attente</button>}
            {fetchedTimes && fetchedTimes.length < 2 && <button onClick={() => handleOpenTime("meanServingTime")} className='  bg-black py-2 px-4 rounded-md text-white text-sm flex items-center gap-2 my-4'><IoAddCircleOutline size={20} /> Ajouter Le temps moyen de traitement</button>}
            {fetchedTimes && fetchedTimes.length < 3 && <button onClick={() => handleOpenTime("minimalServingTime")} className='  bg-black py-2 px-4 rounded-md text-white text-sm flex items-center gap-2 my-4'><IoAddCircleOutline size={20} /> Ajouter Le temps minimal de traitement</button>}
            <Modal
                open={openTime}
                onClose={handleCloseTime}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div className=' w-1/4 bg-white p-4  rounded-lg mx-auto my-12'>
                    <p className=' text-sm font-semibold py-2'>Temps</p>
                    <div style={{ width: 300, margin: 'auto' }}>
                        <p className=' text-xs font-medium'>Choisissez un temps</p>
                        <Slider
                            value={value}
                            onChange={handleChange}
                            aria-labelledby="discrete-slider"
                            valueLabelDisplay="auto"
                            step={1}
                            marks
                            min={1}
                            max={180}
                            className=' text-black'
                        />
                        <p className=' text-xs'>{value} minutes</p>

                    </div>
                    <div className=' py-4 flex items-center justify-center gap-3'>
                        <button className=' w-full bg-black hover:bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={submitTime}>Soumettre</button>
                    </div>
                </div>
            </Modal>
            <Modal
                open={openEditTime}
                onClose={handleCloseEditTime}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div className=' w-1/4 bg-white p-4  rounded-lg mx-auto my-12'>
                    <p className=' text-sm font-semibold py-2'>Modifier Temps</p>
                    <div style={{ width: 300, margin: 'auto' }}>
                        <p className=' text-xs font-medium'>Choisissez un temps</p>
                        <Slider
                            value={value}
                            onChange={handleChange}
                            aria-labelledby="discrete-slider"
                            valueLabelDisplay="auto"
                            step={1}
                            marks
                            min={1}
                            max={180}
                            className=' text-black'
                        />
                        <p className=' text-xs'>{value} minutes</p>

                    </div>
                    <div className=' py-4 flex items-center justify-center gap-3'>
                        <button className=' w-full bg-black hover:bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={updateTime}>Soumettre</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default Time