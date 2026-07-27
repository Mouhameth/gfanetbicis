"use client";
import useChangeHeaderTitle from "@/app/hooks/useChangedHeader";
import Loader from "@/components/common/Loader";
import MyModal from "@/components/Modal";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { Currency } from "@/types/currency";
import { Office } from "@/types/office";
import { Sentence } from "@/types/sentence";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { IoIosAddCircle } from "react-icons/io";
import { MdDelete, MdInfoOutline, MdOutlineNumbers, MdPublish, MdUnpublished } from "react-icons/md";
import useSWR from "swr";
import * as zod from "zod";

const schema = zod.object({
    id: zod.any().optional(),
    text: zod.any().optional(),
    devis: zod.string({
        required_error: "la devis est obligatoire"
    }).min(1, { message: "La devis est obligatoire" }),
    buy: zod.number({
        required_error: "l'achat est obligatoire",
        invalid_type_error: "l'achat est obligatoire"
    }),
    sell: zod.number({
        required_error: "la vente est obligatoire",
        invalid_type_error: "la vente est obligatoire"
    })
}).required();
type FormData = zod.infer<typeof schema>;

const currencies: Currency[] = [
    { name: "Dollar américain", code: "USD", symbol: "$", flag: "🇺🇸" },
    { name: "Euro", code: "EUR", symbol: "€", flag: "🇪🇺" },
    { name: "Livre sterling", code: "GBP", symbol: "£", flag: "🇬🇧" },
    { name: "Yen japonais", code: "JPY", symbol: "¥", flag: "🇯🇵" },
    { name: "Franc CFA", code: "XOF", symbol: "CFA", flag: "🇸🇳" }, // Exemple pour Sénégal
    { name: "Dollar canadien", code: "CAD", symbol: "$", flag: "🇨🇦" },
    { name: "Dollar australien", code: "AUD", symbol: "$", flag: "🇦🇺" },
    { name: "Franc suisse", code: "CHF", symbol: "CHF", flag: "🇨🇭" },
    { name: "Yuan Renminbi chinois", code: "CNY", symbol: "¥", flag: "🇨🇳" },
    { name: "Roupie indienne", code: "INR", symbol: "₹", flag: "🇮🇳" },
    { name: "Rouble russe", code: "RUB", symbol: "₽", flag: "🇷🇺" },
    { name: "Réal brésilien", code: "BRL", symbol: "R$", flag: "🇧🇷" },
    { name: "Rand sud-africain", code: "ZAR", symbol: "R", flag: "🇿🇦" },
    { name: "Peso mexicain", code: "MXN", symbol: "$", flag: "🇲🇽" },
    { name: "Won sud-coréen", code: "KRW", symbol: "₩", flag: "🇰🇷" },
    { name: "Livre égyptienne", code: "EGP", symbol: "£", flag: "🇪🇬" },
    { name: "Roupie indonésienne", code: "IDR", symbol: "Rp", flag: "🇮🇩" },
    { name: "Dirham marocain", code: "MAD", symbol: "د.م.", flag: "🇲🇦" },
    { name: "Dinar tunisien", code: "TND", symbol: "د.ت", flag: "🇹🇳" },
    { name: "Dollar singapourien", code: "SGD", symbol: "$", flag: "🇸🇬" },
    { name: "Dinar algérien", code: "DZD", symbol: "د.ج", flag: "🇩🇿" }
];
const Home = () => {
    const useChangeTitle = useChangeHeaderTitle();
    const axiosAuth = useAxiosAuth();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openPreview, setOpenPreview] = useState(false);
    const [openUnpreview, setOpenUnpreview] = useState(false);
    const [openPublish, setOpenPublish] = useState(false);
    const [openUnpublish, setOpenUnpublish] = useState(false);
    const [devisToEdit, setdevisToEdit] = useState<Sentence>();

    useEffect(() => {
        useChangeTitle.onChanged("Devises");
    }, []);

    const url = `/sentence/devis`;
    const urlOffices = `/office`;

    const { data: fetchedCurrency, isLoading, error, mutate } = useSWR(url, async () => {
        const response = await axiosAuth.get<Sentence[]>(url);
        return response.data;
    });

    const { data: fetchedOffices } = useSWR(urlOffices, () => axiosAuth.get<Office[]>(urlOffices).then((res) => res.data));

    const [publishOfficeIds, setPublishOfficeIds] = useState<Set<number>>(new Set());
    const togglePublishOfficeId = (id: number) => {
        setPublishOfficeIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    const resetPublishOfficeIds = () => setPublishOfficeIds(new Set());

    const [targetsToShow, setTargetsToShow] = useState<Sentence | null>(null);
    const handleOpenTargets = (sentence: Sentence) => setTargetsToShow(sentence);
    const handleCloseTargets = () => setTargetsToShow(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const handleOpenDelete = (devis: Sentence) => {
        setdevisToEdit(devis);
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

    const handleOpenEdit = (devis: Sentence) => {
        setdevisToEdit(devis);
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
    };

    const handleOpenPreview = (devis: Sentence) => {
        setdevisToEdit(devis);
        setOpenPreview(true);
    };

    const handleClosePreview = () => {
        setOpenPreview(false);
    };

    const handleOpenUnpreview = (devis: Sentence) => {
        setdevisToEdit(devis);
        setOpenUnpreview(true);
    };

    const handleCloseUnpreview = () => {
        setOpenUnpreview(false);
    };

    const handleOpenPublish = (devis: Sentence) => {
        setdevisToEdit(devis);
        resetPublishOfficeIds();
        setOpenPublish(true);
    };

    const handleClosePublish = () => {
        setOpenPublish(false);
        resetPublishOfficeIds();
    };

    const handleOpenUnpublish = (devis: Sentence) => {
        setdevisToEdit(devis);
        setOpenUnpublish(true);
    };

    const handleCloseUnpublish = () => {
        setOpenUnpublish(false);
    };

    const togglePreviewDevis = async (close: () => void) => {
        try {
            close();
            setLoading(true);
            const res = await axiosAuth.put(`/sentence/visual-display/${devisToEdit?.id}`);
            if (res.status == 200) {
                toast.success('Opération réussie!', { duration: 3000, className: " text-xs" });
                mutate();
            }
        } catch (error) {
            toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
        } finally {
            setLoading(false);
        }
    }

    const publishDevis = async () => {
        try {
            const officeIds = Array.from(publishOfficeIds);
            handleClosePublish();
            setLoading(true);
            const res = await axiosAuth.put(`/sentence/publish/${devisToEdit?.id}`, { officeIds });
            if (res.status == 200) {
                toast.success('Publication réussie!', { duration: 3000, className: " text-xs" });
                mutate();
            }
        } catch (error) {
            toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
        } finally {
            setLoading(false);
        }
    }

    const unpublishDevis = async () => {
        try {
            handleCloseUnpublish();
            setLoading(true);
            const res = await axiosAuth.put(`/sentence/${devisToEdit?.id}`);
            if (res.status == 200) {
                toast.success('Publication retirée!', { duration: 3000, className: " text-xs" });
                mutate();
            }
        } catch (error) {
            toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
        } finally {
            setLoading(false);
        }
    }

    const onSubmit = useCallback(async (data: FormData) => {
        try {
            setLoading(true);
            data.text = `DEVISE: ${data.devis} , ACHAT : ${data.buy} VENTE : ${data.sell}.`
            const res = await axiosAuth.post(url, data);
            if (res.status == 201) {
                reset();
                toast.success('Une devise a été ajoutée avec succés!', { duration: 3000, className: " text-xs" });
                mutate();
            }
            else if (res.status == 400) {
                toast.error('Erreur, réessayer!', { duration: 3000, className: " text-xs" });
            }
        }
        catch (error: any) {
            toast.error('Erreur, réessayer!', { duration: 3000, className: " text-xs" });
        }
        finally {
            setLoading(false);
        }

    }, [reset, setLoading]);

    const onEdit = useCallback(async (data: FormData) => {
        try {
            setLoading(true);
            handleCloseEdit();
            data.text = `DEVISE: ${data.devis} , ACHAT : ${data.buy} VENTE : ${data.sell}.`
            const res = await axiosAuth.put(`${url}/update`, data);
            if (res.status == 200) {
                reset();
                toast.success('La devise a été modifiée avec succés!', { duration: 3000, className: " text-xs" });
                mutate();
            }
            else if (res.status == 400) {
                toast.error('Erreur, réessayer!', { duration: 3000, className: " text-xs" });
            }
        }
        catch (error: any) {
            toast.error('Erreur, réessayer!', { duration: 3000, className: " text-xs" });
        }
        finally {
            setLoading(false);
        }

    }, [reset, setLoading]);

    const deleteDevis = async () => {
        try {
            handleCloseDelete();
            setLoading(true);

            const res = await axiosAuth.delete(`/sentence/${devisToEdit?.id}`);
            if (res.status == 200) {
                toast.success('Suppression réussie!', { duration: 3000, className: " text-xs" });
                mutate();
            }
        } catch (error) {
            toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
        } finally {
            setLoading(false);
        }
    }

    const bodyContent = (
        <form className="flex flex-col gap-2 mb-4" onSubmit={handleSubmit(onSubmit)}>
            <select className='flex items-center border border-black rounded-lg dark:border-black p-3 text-xs  placeholder:text-gray-100 focus:outline-gray'
                {...register("devis")} >
                <option value="">--Sélectionnez une devise--</option>
                {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}><span>{currency.flag}</span>  {currency.name} ({currency.symbol}) - {currency.code}</option>
                ))}
            </select>
            <p className=" text-xs text-red-500">{errors.devis?.message}</p>

            <div className="flex items-center border border-black rounded-lg dark:border-black  p-3 text-xs placeholder:text-gray focus:outline-gray">
                <span className="pr-2">
                    <MdOutlineNumbers className="h-5 w-5 text-black" />
                </span>
                <input
                    className="flex-1 focus:outline-none"
                    type="text"
                    placeholder="L'achat"
                    {...register("buy", { valueAsNumber: true })}
                />
            </div>
            <p className=" text-xs text-red-500">{errors.buy?.message}</p>

            <div className="flex items-center border border-black rounded-lg dark:border-black  p-3 text-xs placeholder:text-gray focus:outline-gray">
                <span className="pr-2">
                    <MdOutlineNumbers className="h-5 w-5 text-black" />
                </span>
                <input
                    className="flex-1 focus:outline-none"
                    type="text"
                    placeholder="La vente"
                    {...register("sell", { valueAsNumber: true })}
                />
            </div>
            <p className=" text-xs text-red-500">{errors.sell?.message}</p>
            <input className=" w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-lg mt-2" value="Soumettre" type="submit" />
        </form>
    );

    const bodyEditContent = (
        <form className="flex flex-col gap-2 mb-4" onSubmit={handleSubmit(onEdit)}>
            <input
                type="hidden"
                value={devisToEdit?.id}
                {...register("id", { valueAsNumber: true })}
            />

            <select className='flex items-center border border-black rounded-lg dark:border-black p-3 text-xs  placeholder:text-gray-100 focus:outline-gray'
                {...register("devis")} >
                <option value={devisToEdit?.devis}>{devisToEdit?.devis}</option>
                {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}><span>{currency.flag}</span>  {currency.name} ({currency.symbol}) - {currency.code}</option>
                ))}
            </select>
            <p className=" text-xs text-red-500">{errors.devis?.message}</p>

            <div className="flex items-center border border-black rounded-lg dark:border-black  p-3 text-xs placeholder:text-gray focus:outline-gray">
                <span className="pr-2">
                    <MdOutlineNumbers className="h-5 w-5 text-black" />
                </span>
                <input
                    className="flex-1 focus:outline-none"
                    type="text"
                    placeholder="L'achat"
                    defaultValue={devisToEdit?.buy}
                    {...register("buy", { valueAsNumber: true })}
                />
            </div>
            <p className=" text-xs text-red-500">{errors.buy?.message}</p>

            <div className="flex items-center border border-black rounded-lg dark:border-black  p-3 text-xs placeholder:text-gray focus:outline-gray">
                <span className="pr-2">
                    <MdOutlineNumbers className="h-5 w-5 text-black" />
                </span>
                <input
                    className="flex-1 focus:outline-none"
                    type="text"
                    placeholder="La vente"
                    defaultValue={devisToEdit?.sell}
                    {...register("sell", { valueAsNumber: true })}
                />
            </div>
            <p className=" text-xs text-red-500">{errors.sell?.message}</p>
            <input className=" w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-lg mt-2" value="Soumettre" type="submit" />
        </form>
    );

    const officePicker = (
        <div className=' my-3'>
            <p className=' text-xs font-semibold mb-1'>Cibler les agences</p>
            <p className=' text-[10px] text-gray-500 mb-2'>Aucune sélection = diffusion à toutes les agences</p>
            <div className=' grid grid-cols-2 gap-1 max-h-40 overflow-auto border border-gray-200 rounded p-2'>
                {(fetchedOffices ?? []).map((office) => {
                    const checked = publishOfficeIds.has(office.id);
                    return (
                        <label key={office.id} className=' flex items-center gap-2 text-xs cursor-pointer p-1 hover:bg-gray-50 rounded'>
                            <input
                                type='checkbox'
                                checked={checked}
                                onChange={() => togglePublishOfficeId(office.id)}
                                className=' w-3.5 h-3.5 accent-black cursor-pointer'
                            />
                            <span className=' truncate'>{office.name}</span>
                        </label>
                    );
                })}
                {(fetchedOffices ?? []).length === 0 && (
                    <p className=' text-[10px] text-gray-400 text-center col-span-2 py-2'>Aucune agence</p>
                )}
            </div>
            <p className=' text-[10px] text-blue-600 mt-1'>
                {publishOfficeIds.size === 0
                    ? 'Toutes les agences (diffusion globale)'
                    : `${publishOfficeIds.size} agence(s) sélectionnée(s)`}
            </p>
        </div>
    );

    if (isLoading || loading || error) {
        return <Loader />
    }

    return (
        <div className='bg-slate-100 h-screen  w-full rounded-t-xl p-4 overflow-auto'>
            <button className=" px-4 py-2 bg-black flex items-center gap-2 text-white text-xs rounded-md" onClick={handleOpen}>
                <IoIosAddCircle /> <p>Nouvelle</p>
            </button>
            {fetchedCurrency!.length > 0 ? <table className="w-full table-fixed">
                <thead>
                    <tr className="">
                        <th className=" w-12 py-4 text-left text-black text-xs font-semibold">No</th>
                        <th className="w-1/6 py-4 text-left text-black text-xs font-semibold">Devise</th>
                        <th className='w-1/6 py-4 text-left text-black text-xs font-semibold'>Achat</th>
                        <th className="w-1/6 py-4 text-left text-black text-xs font-semibold">Vente</th>
                        <th className='w-1/4 py-4 text-left text-black text-xs font-semibold'>Diffusion</th>
                        <th className='w-8 py-4 text-left text-black text-xs font-semibold'> </th>
                        <th className='w-8 py-4 text-left text-black text-xs font-semibold'> </th>
                        <th className='w-8 py-4 text-left text-black text-xs font-semibold'> </th>
                        <th className='w-8 py-4 text-left text-black text-xs font-semibold'> </th>
                        <th className='w-8 py-4 text-left text-black text-xs font-semibold'> </th>
                    </tr>
                </thead>
                {
                    fetchedCurrency?.map((text, index) => (
                        <tr key={text.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className=' text-xs p-3'>
                                <p>{index + 1}</p>
                            </td>
                            <td className='text-xs py-3 pr-12 text-justify'>
                                <p>{text.devis}</p>
                            </td>
                            <td className='text-xs py-3 pr-12 text-justify'>
                                <p>{text.buy}</p>
                            </td>
                            <td className='text-xs py-3 pr-12 text-justify'>
                                <p>{text.sell}</p>
                            </td>
                            <td className='text-xs'>
                                <div className=' flex flex-wrap gap-1'>
                                    {text.visualDisplay
                                        ? <span className=' bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full'>En aperçu</span>
                                        : <span className=' bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full'>Hors aperçu</span>}
                                    {text.selected
                                        ? <span className=' bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full'>Publié</span>
                                        : <span className=' bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full'>Non publié</span>}
                                </div>
                            </td>
                            <td>
                                <FiEdit3 onClick={() => handleOpenEdit(text)} size={16} className=" cursor-pointer" />
                            </td>
                            <td>
                                {text.visualDisplay
                                    ? <FaEyeSlash onClick={() => handleOpenUnpreview(text)} size={18} className=" cursor-pointer text-orange-500" title="Retirer de l'aperçu" />
                                    : <FaEye onClick={() => handleOpenPreview(text)} size={18} className=" cursor-pointer text-gray-700" title="Mettre en aperçu" />}
                            </td>
                            <td>
                                {text.selected
                                    ? <MdUnpublished onClick={() => handleOpenUnpublish(text)} size={20} className=" cursor-pointer text-red-500 hover:text-red-700" title="Annuler la publication" />
                                    : <MdPublish onClick={() => handleOpenPublish(text)} size={20} className=" cursor-pointer text-blue-500 hover:text-blue-700" title="Publier sur le réseau" />}
                            </td>
                            <td>
                                {text.selected && (
                                    <MdInfoOutline onClick={() => handleOpenTargets(text)} size={18} className=" cursor-pointer text-gray-500 hover:text-blue-600" title="Voir les agences ciblées" />
                                )}
                            </td>
                            <td>
                                <MdDelete onClick={() => handleOpenDelete(text)} size={16} className=" cursor-pointer hover:text-red-500" />
                            </td>
                        </tr>
                    ))
                }
            </table>
                :
                <div className=" bg-white p-2 text-center text-xs mt-2 rounded-md">
                    <p>Aucune devise</p>
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
                    actionLabel='Nouvelle devise'
                    title='Ajouter devise'
                    isOpen={open}
                    disabled={loading}
                    body={bodyContent}
                />
            </Modal>

            <Modal
                open={openEdit}
                onClose={handleCloseEdit}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                className=''
            >
                <MyModal
                    onClose={handleCloseEdit}
                    actionLabel='Modifier devise'
                    title='Modifier devise'
                    isOpen={openEdit}
                    disabled={loading}
                    body={bodyEditContent}
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
                    <p className=' text-xs font-semibold text-center'>Voulez-vous supprimer la devis: {devisToEdit?.devis}</p>
                    <div className=' py-4 flex items-center justify-center gap-3'>
                        <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={deleteDevis}>Oui</button>
                        <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseDelete}>Non</button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={openPreview}
                onClose={handleClosePreview}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div className=' w-1/4 bg-white p-4 rounded-lg mx-auto my-12'>
                    <p className=' text-sm font-semibold py-2'>Mettre en aperçu</p>
                    <p className=' text-xs font-semibold text-center'>Voulez-vous afficher cette devise sur l&apos;afficheur d&apos;aperçu ?</p>
                    <div className=' py-4 flex items-center justify-center gap-3'>
                        <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={() => togglePreviewDevis(handleClosePreview)}>Oui</button>
                        <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleClosePreview}>Non</button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={openUnpreview}
                onClose={handleCloseUnpreview}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div className=' w-1/4 bg-white p-4 rounded-lg mx-auto my-12'>
                    <p className=' text-sm font-semibold py-2'>Retirer de l&apos;aperçu</p>
                    <p className=' text-xs font-semibold text-center'>Voulez-vous retirer cette devise de l&apos;afficheur d&apos;aperçu ?</p>
                    <div className=' py-4 flex items-center justify-center gap-3'>
                        <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={() => togglePreviewDevis(handleCloseUnpreview)}>Oui</button>
                        <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseUnpreview}>Non</button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={openPublish}
                onClose={handleClosePublish}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div className=' w-1/3 max-w-md bg-white p-4 rounded-lg mx-auto my-12'>
                    <p className=' text-sm font-semibold py-2'>Publier</p>
                    <p className=' text-xs text-center text-gray-600'>Choisissez les agences cibles, puis validez.</p>
                    {officePicker}
                    <div className=' py-4 flex items-center justify-center gap-3'>
                        <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={publishDevis}>Publier</button>
                        <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleClosePublish}>Annuler</button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={!!targetsToShow}
                onClose={handleCloseTargets}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div className=' w-1/3 max-w-md bg-white p-4 rounded-lg mx-auto my-12'>
                    <p className=' text-sm font-semibold py-2'>Agences ciblées</p>
                    {targetsToShow && (() => {
                        const offices = targetsToShow.Offices ?? [];
                        if (offices.length === 0) {
                            return (
                                <div className=' bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md text-xs text-center'>
                                    Diffusion globale&nbsp;: cette devise est publiée sur <strong>toutes les agences</strong>.
                                </div>
                            );
                        }
                        return (
                            <>
                                <p className=' text-xs text-gray-600 mb-2'>Cette devise est diffusée uniquement sur les agences suivantes&nbsp;:</p>
                                <div className=' max-h-60 overflow-auto border border-gray-200 rounded p-2'>
                                    <ul className=' grid grid-cols-2 gap-1'>
                                        {offices.map((o) => (
                                            <li key={o.id} className=' text-xs py-1 px-2 bg-gray-50 rounded truncate'>{o.name}</li>
                                        ))}
                                    </ul>
                                </div>
                                <p className=' text-[10px] text-gray-500 mt-2 text-right'>{offices.length} agence{offices.length > 1 ? 's' : ''}</p>
                            </>
                        );
                    })()}
                    <div className=' py-4 flex items-center justify-end'>
                        <button className=' bg-black hover:bg-gray-800 text-white text-sm font-semibold py-2 px-4 rounded-md' onClick={handleCloseTargets}>Fermer</button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={openUnpublish}
                onClose={handleCloseUnpublish}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div className=' w-1/4 bg-white p-4 rounded-lg mx-auto my-12'>
                    <p className=' text-sm font-semibold py-2'>Annuler la publication</p>
                    <p className=' text-xs font-semibold text-center'>Voulez-vous retirer cette devise du réseau d&apos;afficheurs ?</p>
                    <div className=' py-4 flex items-center justify-center gap-3'>
                        <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={unpublishDevis}>Oui</button>
                        <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseUnpublish}>Non</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default Home