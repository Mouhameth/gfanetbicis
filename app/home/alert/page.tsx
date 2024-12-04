"use client";
import useChangeHeaderTitle from "@/app/hooks/useChangedHeader";
import Loader from "@/components/common/Loader";
import MyModal from "@/components/Modal";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { Alert } from "@/types/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { IoIosAddCircle, IoIosClose } from "react-icons/io";
import { MdOutlineNumbers } from "react-icons/md";
import { TbAlertTriangleFilled } from "react-icons/tb";
import useSWR from "swr";
import * as zod from "zod";

const schema = zod.object({
    id: zod.any().optional(),
    type: zod.enum(['OVERWAITING', 'OVERPROCESSING', 'COUNT', 'INACTIVE', 'MONO'], {
        errorMap: (issue, _ctx) => {
            if (issue.code === "invalid_enum_value") {
                return { message: "Sélectionner un type." };
            }
            return { message: "Une erreur est survenue." };
        }
    }),
    count: zod.any().optional()
}).required();
type FormData = zod.infer<typeof schema>;

const Home = () => {
    const useChangeTitle = useChangeHeaderTitle();
    const axiosAuth = useAxiosAuth();
    const [alertType, setAlertType] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [alertToEdit, setAlertToEdit] = useState<Alert>();

    useEffect(() => {
        useChangeTitle.onChanged("Alertes");
    }, []);

    const urlAlert = `/alert`;

    const { data: fetchedAlert, isLoading, error, mutate } = useSWR(urlAlert, async () => {
        const response = await axiosAuth.get<Alert[]>(urlAlert);
        return response.data;
    });

    const { register, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const handleOpenDelete = (alert: Alert) => {
        setAlertToEdit(alert);
        setOpenDelete(true);
    };

    const handleCloseDelete = () => {
        setOpenDelete(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const onSubmit = useCallback(async (data: FormData) => {
        try {
            const countValue = getValues("count");

            if (alertType === "OVERWAITING" || alertType === "OVERPROCESSING" || alertType === "COUNT") {
                if (!countValue || countValue < 1) {
                    toast.error('Veuillez entrer un nombre valide supérieur à 0.', { duration: 3000, className: "text-xs" });
                    return;
                }
            }

            setLoading(true);
            const res = await axiosAuth.post(urlAlert, data);
            if (res.status == 201) {
                reset();
                toast.success('Une alerte a été ajoutée avec succés!', { duration: 3000, className: " text-xs" });
                mutate();
                setAlertType("");
            }
            else if (res.status == 400) {
                toast.error('Cette alerte existe déjà, réessayer!', { duration: 3000, className: " text-xs" });
            }
        }
        catch (error: any) {
            toast.error('Erreur, réessayer!', { duration: 3000, className: " text-xs" });
        }
        finally {
            setLoading(false);
        }

    }, [reset, setLoading, alertType, setAlertType, getValues]);

    const deleteAlert = async () => {
        try {
            handleCloseDelete();
            setLoading(true);

            const res = await axiosAuth.delete(`${urlAlert}/${alertToEdit?.id}`);
            if (res.status == 200) {
                reset();
                toast.success('Suppression réussie!', { duration: 3000, className: " text-xs" });
                mutate();
            }
        } catch (error) {
            toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
        } finally {
            setLoading(false);
        }
    }

    const renderTargetField = () => {
        switch (alertType) {
            case "COUNT":
                return (
                    <div className="flex items-center border border-black rounded-lg dark:border-black  p-3 text-xs placeholder:text-gray focus:outline-gray">
                        <span className="pr-2">
                            <MdOutlineNumbers className="h-5 w-5 text-black" />
                        </span>
                        <input
                            className="flex-1 focus:outline-none"
                            type="text"
                            placeholder="Le nombre de personnes en attente"
                            {...register("count", { valueAsNumber: true })}
                        />
                    </div>
                );
            case "OVERWAITING":
                return (
                    <div className="flex items-center border border-black rounded-lg dark:border-black  p-3 text-xs placeholder:text-gray focus:outline-gray">
                        <span className="pr-2">
                            <MdOutlineNumbers className="h-5 w-5 text-black" />
                        </span>
                        <input
                            className="flex-1 focus:outline-none"
                            type="text"
                            placeholder="Le temps d'attente"
                            {...register("count", { valueAsNumber: true })}
                        />
                    </div>
                );
            case "OVERPROCESSING":
                return (
                    <div className="flex items-center border border-black rounded-lg dark:border-black  p-3 text-xs placeholder:text-gray focus:outline-gray">
                        <span className="pr-2">
                            <MdOutlineNumbers className="h-5 w-5 text-black" />
                        </span>
                        <input
                            className="flex-1 focus:outline-none"
                            type="text"
                            placeholder="Le temps de traitement"
                            {...register("count", { valueAsNumber: true })}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const bodyContent = (
        <form className="flex flex-col gap-2 mb-4" onSubmit={handleSubmit(onSubmit)}>
            <select className='flex items-center border border-black rounded-lg dark:border-black p-3 text-xs  placeholder:text-gray-100 focus:outline-gray'
                {...register("type", {
                    onChange: (e) => setAlertType(e.target.value)
                })} >
                <option value="">--Sélectionnez le type d&apos;alerte--</option>
                <option value="OVERWAITING">Recevoir une alerte sur un temps d&apos;attente élevé</option>
                <option value="COUNT">Recevoir une alerte sur une affluence élevée</option>
                <option value="OVERPROCESSING">Recevoir une alerte sur un temps de traitement élevé</option>
                <option value="INACTIVE">Recevoir une alerte sur une inactivité longue</option>
                <option value="MONO">Recevoir une alerte sur un système monofonctionnel</option>

            </select>
            <p className=" text-xs text-red-500">{errors.type?.message}</p>

            {alertType && renderTargetField()}
            <input className=" w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-lg mt-2" value="Soumettre" type="submit" />
        </form>
    );

    if (isLoading || loading || error) {
        return <Loader />
    }

    return (
        <div className='bg-slate-100 h-screen  w-full rounded-t-xl p-4 overflow-auto'>
            <button className=" px-4 py-2 bg-black flex items-center gap-2 text-white text-xs rounded-md" onClick={handleOpen}>
                <IoIosAddCircle /> <p>Nouveau</p>
            </button>
            {
                fetchedAlert!.length > 0 ?
                    <div className=" grid grid-cols-2 gap-4 mt-8">
                        {
                            fetchedAlert?.map((alert) => (

                                <div key={alert.id} className=" flex flex-col justify-between bg-white border-[2px] border-neutral-200 rounded-xl p-2">
                                    <div className=" flex justify-between items-start p-2">
                                        <div className=" flex gap-4 items-start justify-start pr-3">
                                            <div className=" w-8 h-8 flex justify-center items-center bg-white p-2 rounded-full shadow-sm shadow-blue-300 text-black border">
                                                <TbAlertTriangleFilled size={24} />
                                            </div>
                                            <div>
                                                <h1 className=" text-black text-sm font-semibold">
                                                    {alert.type === "OVERWAITING" && `Alerte sur un temps d'attente élevé`}
                                                    {alert.type === "OVERPROCESSING" && `Alerte sur un temps de traitement élevé`}
                                                    {alert.type === "COUNT" && `Alerte sur une affluence élevée`}
                                                    {alert.type === "INACTIVE" && `Alerte sur une inactivité longue`}
                                                    {alert.type === "MONO" && `Alerte sur un système monofonctionnel`}
                                                </h1>
                                                <hr className=" w-12 text-blue-300 my-3" />
                                                <h1 className=" text-black text-xs font-semibold">
                                                    {alert.content}
                                                </h1>
                                            </div>

                                        </div>
                                        <button className=" hover:text-red-500" onClick={() => handleOpenDelete(alert)}><IoIosClose size={18} /></button>
                                    </div>
                                    <p className=" px-2 text-xs text-gray-400">Créée le: {new Date(alert.createdAt).toLocaleString("fr-FR", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}</p>
                                </div>
                            ))
                        }
                    </div> :
                    <div className=" bg-white p-2 text-center text-xs mt-2 rounded-md">
                        <p>Aucune alerte</p>
                    </div>
            }
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                className=''
            >
                <MyModal
                    onClose={handleClose}
                    actionLabel='Modifier texte'
                    title='Modifier texte'
                    isOpen={open}
                    disabled={loading}
                    body={bodyContent}
                />
            </Modal>

            <Modal
                open={openDelete}
                onClose={handleCloseDelete}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div className=' w-1/4 bg-white p-4  rounded-lg mx-auto my-12'>
                    <p className=' text-sm font-semibold py-2'>Suppression</p>
                    <p className=' text-xs font-semibold text-center'>Voulez-vous supprimer l&apos;alerte: {alertToEdit?.content}</p>
                    <div className=' py-4 flex items-center justify-center gap-3'>
                        <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={deleteAlert}>Oui</button>
                        <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseDelete}>Non</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default Home