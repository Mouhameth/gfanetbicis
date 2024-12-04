"use client";
import useChangeHeaderTitle from '@/app/hooks/useChangedHeader';
import Loader from '@/components/common/Loader';
import { Modal, Slider, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import * as zod from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MyModal from '@/components/Modal';
import { useDropzone } from 'react-dropzone';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import useSWR from 'swr';
import { LuDownload } from 'react-icons/lu';
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdDelete, MdOutlineTimer, MdPower, MdPowerOff } from 'react-icons/md';
import { FiEdit3 } from 'react-icons/fi';
import { PiTextAUnderlineBold } from 'react-icons/pi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { FaCirclePlay } from "react-icons/fa6";
import { FaPauseCircle } from 'react-icons/fa';
import { Sentence } from '@/types/sentence';

const schema = zod.object({
  id: zod.any().optional(),
  text: zod.string({
    required_error: "La réponse est obligatoire"
  }).min(2, { message: "Entrer un texte" })
}).required();
type FormData = zod.infer<typeof schema>;

const Medias = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  const useChangeTitle = useChangeHeaderTitle();
  const url = `/multimedia`;
  const urlSentences = `/sentence`;
  const { data: fetchedMedias, isLoading, mutate } = useSWR(url, () => axiosAuth.get<Media[]>(url).then((res) => res.data));
  const { data: fetchedSentences, isLoading: sentencesLoading, error: sentencesError, mutate: sentencesMutate } = useSWR(`${urlSentences}/all`, () => axiosAuth.get<Sentence[]>(`${urlSentences}/all`).then((res) => res.data), {
    dedupingInterval: 0
  });
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [openAddSentence, setOpenAddSentence] = useState(false);
  const handleOpenAddSentence = () => setOpenAddSentence(true);
  const handleCloseAddSentence = () => setOpenAddSentence(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [openActive, setOpenActive] = useState(false);
  const [openUnactive, setOpenUnactive] = useState(false);
  const [openActiveSentence, setOpenActiveSentence] = useState(false);
  const [openUnactiveSentence, setOpenUnactiveSentence] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeleteSentence, setOpenDeleteSentence] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openEditTime, setOpenEditTime] = useState(false);
  const axiosAuth = useAxiosAuth();
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": ['.png', '.PNG'],
      "image/jpg": [".jpg", ".JPG"],
      "image/jpeg": [".jpeg", ".JPEG"],
      "video/mp4": ['.mp4', '.MP4']
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const type = acceptedFiles[0].type.split('/')[0];
        if (type === "image") {
          const file = new FileReader;
          file.readAsArrayBuffer(acceptedFiles[0]);
        }
      }
    }
  });

  const [value, setValue] = useState(0);

  const handleChange = (event: Event, newValue: number | number[]) => {

    if (typeof newValue === 'number') {
      setValue(newValue);
    }
  };

  const mediaToDelete: Media = {
    id: 0,
    url: '',
    type: '',
    selected: false,
    createdAt: new Date(),
    playTime: 0
  };

  const sentenceToDelete: Sentence = {
    id: 0,
    text: '',
    selected: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const [mediaToRemove, setMediaToRemove] = useState(mediaToDelete);
  const [sentenceToUpdate, setSentenceToUpdate] = useState(sentenceToDelete);
  const [openEdit, setOpenEdit] = useState(false);

  const handleOpenActive = (media: Media) => {
    setMediaToRemove(media);
    setOpenActive(true);
  };

  const handleCloseActive = () => {
    setMediaToRemove(mediaToDelete);
    setOpenActive(false);
  };

  const handleOpenEditTime = (media: Media) => {
    setMediaToRemove(media);
    setValue(media.playTime);
    setOpenEditTime(true);
  };

  const handleCloseEditTime = () => {
    setOpenEditTime(false);
  };

  const handleOpenUnactive = (media: Media) => {
    setMediaToRemove(media);
    setOpenUnactive(true);
  };

  const handleCloseUnactive = () => {
    setMediaToRemove(mediaToDelete);
    setOpenUnactive(false);
  };

  const handleOpenActiveSentence = (sentence: Sentence) => {
    setSentenceToUpdate(sentence);
    setOpenActiveSentence(true);
  };

  const handleCloseActiveSentence = () => {
    setSentenceToUpdate(sentenceToDelete);
    setOpenActiveSentence(false);
  };

  const handleOpenUnactiveSentence = (sentence: Sentence) => {
    setSentenceToUpdate(sentence);
    setOpenUnactiveSentence(true);
  };

  const handleCloseUnactiveSentence = () => {
    setSentenceToUpdate(sentenceToDelete);
    setOpenUnactiveSentence(false);
  };

  const handleOpenDelete = (media: Media) => {
    setMediaToRemove(media);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setMediaToRemove(mediaToDelete);
    setOpenDelete(false);
  };

  const handleOpenDeleteSentence = (sentence: Sentence) => {
    setSentenceToUpdate(sentence);
    setOpenDeleteSentence(true);
  };

  const handleCloseDeleteSentence = () => {
    setSentenceToUpdate(sentenceToDelete);
    setOpenDeleteSentence(false);
  };

  const handleOpenEdit = (sentence: Sentence) => {
    setSentenceToUpdate(sentence);
    setOpenEdit(true);
  }

  const handleCloseEdit = () => {
    reset();
    setSentenceToUpdate(sentenceToDelete);
    setOpenEdit(false);
  };

  const activeMedia = async () => {
    try {
      handleCloseActive();
      setLoading(true);
      const res = await axiosAuth.put(`${url}/${mediaToRemove.id}`);
      if (res.status == 200) {
        reset();
        toast.success('Activation réussie!', { duration: 3000, className: " text-xs" });
        mutate();
        sentencesMutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
    }
  }

  const deleteMedia = async () => {
    try {
      handleCloseDelete();
      setLoading(true);
      const res = await axiosAuth.delete(`${url}/${mediaToRemove.id}`);
      if (res.status == 200) {
        reset();
        toast.success('Suppression réussie!', { duration: 3000, className: " text-xs" });
        mutate();
        sentencesMutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
    }
  }

  const unActiveMedia = async () => {
    try {
      handleCloseUnactive();
      setLoading(true);
      const res = await axiosAuth.put(`${url}/${mediaToRemove.id}`);
      if (res.status == 200) {
        reset();
        toast.success('Activation réussie!', { duration: 3000, className: " text-xs" });
        mutate();
        sentencesMutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
    }
  }

  const activeSentence = async () => {
    try {
      handleCloseActiveSentence();
      setLoading(true);
      const res = await axiosAuth.put(`${urlSentences}/${sentenceToUpdate.id}`);
      if (res.status == 200) {
        reset();
        toast.success('Activation réussie!', { duration: 3000, className: " text-xs" });
        mutate();
        sentencesMutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
    }
  }

  const deleteSentence = async () => {
    try {
      handleCloseDeleteSentence();
      setLoading(true);
      const res = await axiosAuth.delete(`${urlSentences}/${sentenceToUpdate.id}`);
      if (res.status == 200) {
        reset();
        toast.success('Suppression réussie!', { duration: 3000, className: " text-xs" });
        mutate();
        sentencesMutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
    }
  }

  const unActiveSentence = async () => {
    try {
      handleCloseUnactiveSentence();
      setLoading(true);
      const res = await axiosAuth.put(`${urlSentences}/${sentenceToUpdate.id}`);
      if (res.status == 200) {
        reset();
        toast.success('Activation réussie!', { duration: 3000, className: " text-xs" });
        mutate();
        sentencesMutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
    }
  }

  const updatePlaytime = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.put(url, JSON.stringify({ 'id': mediaToRemove.id, 'playTime': value }));
      if (res.status == 200) {
        toast.success('Opération réussie!', { duration: 3000, className: " text-xs" });
        mutate()
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

  useEffect(() => {
    useChangeTitle.onChanged("Multimédias");
  }, []);

  const onSubmit = async () => {
    try {
      setAddLoading(true);
      const formData = new FormData();
      console.log(acceptedFiles[0]);

      formData.append("file", acceptedFiles[0]);
      const res = await axiosAuth.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.status == 201) {
        toast.success('Opération réussie!', { duration: 3000, className: " text-xs" });
        mutate();
        sentencesMutate();
      }
    }
    catch (error: any) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setAddLoading(false);
    }
  }

  const onSubmitSentence = useCallback(async (data: FormData) => {
    try {
      setAddLoading(true);
      const res = await axiosAuth.post(urlSentences, data);
      if (res.status == 201) {
        reset();
        toast.success('Opération réussie!', { duration: 3000, className: " text-xs" });
        mutate();
        sentencesMutate();
      }
    }
    catch (error: any) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setAddLoading(false);
      reset();
    }
  }, [reset, setAddLoading]);

  const onUpdateSentence = useCallback(async (data: FormData) => {
    try {
      setEditLoading(true);
      console.log(data);

      const res = await axiosAuth.put(urlSentences, data);
      if (res.status == 200) {
        toast.success('Modification réussie!', { duration: 3000, className: " text-xs" });
        mutate();
        sentencesMutate();
      }
    }
    catch (error: any) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setEditLoading(false);
      handleCloseEdit();
    }
  }, [setEditLoading, sentenceToUpdate, handleCloseEdit]);

  const bodyContent = (
    <div className="flex flex-col gap-2 cursor-pointer">
      <div {...getRootProps()} className=' w-full border-[2px] border-dotted border-gray-300 h-40 border-spacing-8 rounded-md p-4 text-center'>
        <input {...getInputProps()} />
        {
          acceptedFiles.length === 0 ?
            <>
              <LuDownload className=" text-black mx-auto" size={80} />
              <p className=' text-gray-400 p-4 text-xs'>Choisissez un fichier ou glisser le ici.</p>
            </>
            :
            <>
              {acceptedFiles.map((file: any) => (
                <div key={file.name} className="flex flex-col items-center">
                  {
                    file.type.split('/')[0] === "image" ?
                    <img className=' rounded-md' src={URL.createObjectURL(file)} alt={file.name} width={150} height={150} />
                    :
                    <video className=' rounded-md' src={URL.createObjectURL(file)} controls width={150} height={150} >
                    </video>
                  }
                  
                  <p className='text-gray-400 p-3 text-xs'>{file.name}</p>
                </div>
              ))}
            </>
        }
      </div>

      {addLoading == false && acceptedFiles.length > 0 && <button className=' w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md' onClick={onSubmit} >Soumettre</button>}
    </div>
  )

  const bodySentenceContent = (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmitSentence)}>
      <textarea {...register("text")} placeholder="Entrer le texte" className=' rounded-md h-48 border-[1px] outline-none p-2 placeholder:text-xs'></textarea>
      <p className="text-xs text-red-500">{errors.text?.message}</p>
      {addLoading == false && <input className=" w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md" value="Soumettre" type="submit" />}
    </form>
  )

  const editSentenceContent = (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit(onUpdateSentence)}>
      <input
        type="hidden"
        value={sentenceToUpdate.id}
        {...register("id", { valueAsNumber: true })}
      />
      <div className="flex items-center border border-gray rounded dark:border-gray  p-3 text-xs placeholder:text-gray focus:outline-gray">
        <span className="pr-2">
          <PiTextAUnderlineBold className="h-3 w-3 text-black" />
        </span>
        <input
          className="flex-1 focus:outline-none"
          type="text"
          placeholder="Nom du role"
          defaultValue={sentenceToUpdate.text}
          {...register("text")}
        />
      </div>
      <p className="text-xs text-red-500">{errors.text?.message}</p>

      {addLoading == false && <input className=" w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md" value="Soumettre" type="submit" />}
    </form>
  )

  if (isLoading || loading || sentencesLoading) {
    return <Loader />
  }

  return (
    <div className=' bg-slate-100 h-screen  w-full rounded-t-xl p-4 overflow-auto'>
      <div className=' flex justify-between'>
        <button onClick={handleOpen} className='  bg-black py-2 px-4 rounded-md text-white text-sm flex items-center gap-2'><IoAddCircleOutline size={20} /> Ajouter un fichier</button>
      </div>
      {
        fetchedMedias ?
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className=' text-sm font-semibold mt-4'>Fichiers</p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className=' py-4 grid grid-cols-4 gap-8'>

                {fetchedMedias?.map((media, index) => (
                  <div key={media.id} className=' w-60 bg-white rounded-md shadow-md p-2'>
                    {
                      media.type === "image" ?
                        <div className=''>
                          <img className=' rounded-md h-32 w-full' src={media.url} alt={`file${index}`} height={50} />
                        </div>
                        : <div className="">
                          <video className='rounded-md h-32 w-full' controls>
                            <source src={media.url} type='video/mp4' />
                          </video>
                        </div>
                    }
                    <div className=' w-full bg-black p-2 rounded-full my-4 flex justify-between'>
                      {
                        media.selected === true ?
                          <p className=' bg-green-200 text-xs text-green-500 py-1 px-2 rounded-full'>
                            En lecture
                          </p> :
                          <p className=' bg-red-200 text-xs text-red-500 py-1 px-2 rounded-full'>
                            En pause
                          </p>
                      }
                      <div className=' flex gap-2 items-center'>
                        {media.type === "image" && <MdOutlineTimer size={20} onClick={() => handleOpenEditTime(media)} className=" cursor-pointer text-white" />}
                        {media.selected ? <FaPauseCircle size={20} onClick={() => handleOpenUnactive(media)} className=" cursor-pointer text-red-500" /> : <FaCirclePlay size={20} onClick={() => handleOpenActive(media)} className=" cursor-pointer text-green-500" />}
                        <MdDelete size={16} onClick={() => handleOpenDelete(media)} className=" cursor-pointer text-red-500" />
                      </div>
                    </div>
                    <p className=' text-xs flex justify-end'>{media.type}</p>
                    <p className=' text-xs flex justify-end'>Ajouté le {format(new Date(media.createdAt), "dd MMMM yyyy", { locale: fr })}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
          :
          <p className=' text-center text-xs'>Aucun fichier</p>
      }

      <button onClick={handleOpenAddSentence} className='  bg-black mt-4 py-2 px-4 rounded-md text-white text-sm flex items-center gap-2'><IoAddCircleOutline size={20} /> Ajouter un texte</button>
      {
        fetchedMedias ?
          <div className=' py-4'>
            <div className="flex items-center justify-between">
              <div>
                <p className=' text-sm font-semibold'>Textes déroulants</p>
              </div>
            </div>
            <table className="w-full table-fixed">
              <thead>
                <tr className="">
                  <th className=" w-48 py-4 text-left text-black text-xs font-semibold">No</th>
                  <th className="w-1/2 py-4 text-left text-black text-xs font-semibold">Texte</th>
                  <th className='w-1/4 py-4 text-left text-black text-xs font-semibold'>Statut</th>
                  <th className='w-8 py-4 text-left text-black text-xs font-semibold'> </th>
                  <th className='w-8 py-4 text-left text-black text-xs font-semibold'> </th>
                </tr>
              </thead>
              {
                fetchedSentences?.map((text, index) => (
                  <tr key={text.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className=' text-xs p-3'>
                      <p>{index + 1}</p>
                    </td>
                    <td className='text-xs py-3 pr-12 text-justify'>
                      <p>{text.text}</p>
                    </td>
                    <td className='text-xs'>
                      {
                        text.selected === true ?
                          <p className=' w-fit bg-green-200 text-green-500 py-1 px-2 rounded-full'>
                            Sélectionné
                          </p> :
                          <p className=' w-fit bg-red-200 text-red-500 py-1 px-2 rounded-full'>
                            Non sélectionner
                          </p>
                      }
                    </td>
                    <td>
                      <FiEdit3 onClick={() => handleOpenEdit(text)} size={16} className=" cursor-pointer" />
                    </td>
                    <td>
                      {text.selected ? <MdPowerOff onClick={() => handleOpenUnactiveSentence(text)} size={20} className=" cursor-pointer text-red-500" /> : <MdPower onClick={() => handleOpenActiveSentence(text)} size={20} className=" cursor-pointer text-green-500" />}
                    </td>
                    <td>
                      <MdDelete onClick={() => handleOpenDeleteSentence(text)} size={16} className=" cursor-pointer hover:text-red-500" />
                    </td>
                  </tr>
                ))
              }
            </table>
          </div> :
          <p className=' text-center text-xs'>Aucun fichier</p>
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
          actionLabel='Ajouter fichier'
          title='Ajouter un fichier'
          isOpen={open}
          disabled={addLoading}
          body={bodyContent}
        />
      </Modal>
      <Modal
        open={openAddSentence}
        onClose={handleCloseAddSentence}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className=''
      >
        <MyModal
          onClose={handleCloseAddSentence}
          actionLabel='Ajouter texte'
          title='Ajouter un texte'
          isOpen={openAddSentence}
          disabled={addLoading}
          body={bodySentenceContent}
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
          actionLabel='Modifier texte'
          title='Modifier texte'
          isOpen={openEdit}
          disabled={editLoading}
          body={editSentenceContent}
        />
      </Modal>
      <Modal
        open={openActive}
        onClose={handleCloseActive}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4  rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Sélectionner</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous jouer ce contenu ?</p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={activeMedia}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseActive}>Non</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openUnactive}
        onClose={handleCloseUnactive}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4  rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Désélectionner</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous mettre en pause ce contenu ?</p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={unActiveMedia}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseUnactive}>Non</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openDelete}
        onClose={handleCloseDelete}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4  rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Suppression</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous supprimer ce fichier</p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={deleteMedia}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseDelete}>Non</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openActiveSentence}
        onClose={handleCloseActiveSentence}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4  rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Sélectionner</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous sélectionner ce texte </p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={activeSentence}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseActiveSentence}>Non</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openUnactiveSentence}
        onClose={handleCloseUnactiveSentence}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4  rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Désélectionner</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous désélectionner ce texte </p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={unActiveSentence}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseUnactiveSentence}>Non</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openDeleteSentence}
        onClose={handleCloseDeleteSentence}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4  rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Suppression</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous supprimer ce texte</p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={deleteSentence}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseDeleteSentence}>Non</button>
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
          <p className=' text-sm font-semibold py-2'>Modifier Temps de lecture</p>
          <div style={{ width: 300, margin: 'auto' }}>
            <p className=' text-xs font-medium'>Choisissez un temps</p>
            <Slider
              value={value}
              onChange={handleChange}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={5}
              max={600}
              className=' text-black'
            />
            {value < 60 ? <p className=' text-xs'>{value} secondes</p> : <p className=' text-xs'>{Math.floor(value / 60)} minutes : {Math.ceil(value % 60)} secondes</p>}
          </div>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' w-full bg-black hover:bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={updatePlaytime}>Soumettre</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Medias