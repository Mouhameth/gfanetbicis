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
import axios from 'axios';
import useSWR from 'swr';
import { LuDownload } from 'react-icons/lu';
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdCloudUpload, MdDelete, MdInfoOutline, MdOutlineTimer, MdPermMedia, MdPublish, MdUnpublished } from 'react-icons/md';
import { FiEdit3 } from 'react-icons/fi';
import { PiTextAUnderlineBold } from 'react-icons/pi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Sentence } from '@/types/sentence';
import { Office } from '@/types/office';

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
  const urlOffices = `/office`;
  const { data: fetchedMedias, isLoading, mutate } = useSWR(`${url}/all`, () => axiosAuth.get<Media[]>(`${url}/all`).then((res) => res.data));
  const { data: fetchedSentences, isLoading: sentencesLoading, error: sentencesError, mutate: sentencesMutate } = useSWR(`${urlSentences}/all`, () => axiosAuth.get<Sentence[]>(`${urlSentences}/all`).then((res) => res.data), {
    dedupingInterval: 0
  });
  const { data: fetchedOffices } = useSWR(urlOffices, () => axiosAuth.get<Office[]>(urlOffices).then((res) => res.data));
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedFiles([]);
  };
  const [openAddSentence, setOpenAddSentence] = useState(false);
  const handleOpenAddSentence = () => setOpenAddSentence(true);
  const handleCloseAddSentence = () => setOpenAddSentence(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeleteSentence, setOpenDeleteSentence] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openEditTime, setOpenEditTime] = useState(false);
  const [openPreviewMedia, setOpenPreviewMedia] = useState(false);
  const [openUnpreviewMedia, setOpenUnpreviewMedia] = useState(false);
  const [openPublishMedia, setOpenPublishMedia] = useState(false);
  const [openUnpublishMedia, setOpenUnpublishMedia] = useState(false);
  const [openPreviewSentence, setOpenPreviewSentence] = useState(false);
  const [openUnpreviewSentence, setOpenUnpreviewSentence] = useState(false);
  const [openPublishSentence, setOpenPublishSentence] = useState(false);
  const [openUnpublishSentence, setOpenUnpublishSentence] = useState(false);
  const axiosAuth = useAxiosAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessageIdx, setUploadMessageIdx] = useState(0);
  const uploadMessages = [
    "Préparation de vos fichiers...",
    "Envoi sécurisé vers le serveur...",
    "Le réseau s'occupe du reste...",
    "Quelques instants encore...",
    "Presque terminé, restez là...",
    "Finalisation de l'upload..."
  ];

  useEffect(() => {
    if (!addLoading) return;
    setUploadMessageIdx(0);
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    uploadMessages.forEach((_, i) => {
      if (i === 0) return;
      timeouts.push(setTimeout(() => setUploadMessageIdx(i), i * 4000));
    });
    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [addLoading]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": ['.png', '.PNG'],
      "image/jpg": [".jpg", ".JPG"],
      "image/jpeg": [".jpeg", ".JPEG"],
      "video/mp4": ['.mp4', '.MP4']
    },
    multiple: true,
    maxFiles: 20,
    onDrop: (dropped) => {
      setSelectedFiles((prev) => {
        const seen = new Set(prev.map((f) => `${f.name}-${f.size}`));
        const fresh = dropped.filter((f) => !seen.has(`${f.name}-${f.size}`));
        return [...prev, ...fresh].slice(0, 20);
      });
    }
  });

  const removeSelectedFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

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
    playTime: 0,
    visuDisplay: false
  };

  const sentenceToDelete: Sentence = {
    id: 0,
    text: '',
    selected: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    visualDisplay: false
  };

  const [mediaToRemove, setMediaToRemove] = useState(mediaToDelete);
  const [sentenceToUpdate, setSentenceToUpdate] = useState(sentenceToDelete);
  const [openEdit, setOpenEdit] = useState(false);
  const [openBulkPublish, setOpenBulkPublish] = useState(false);
  const [idsToPublish, setIdsToPublish] = useState<Set<number>>(new Set());
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<number>>(new Set());
  const [publishOfficeIds, setPublishOfficeIds] = useState<Set<number>>(new Set());
  const [targetsToShow, setTargetsToShow] = useState<{ kind: 'media' | 'sentence'; offices: { id: number; name: string }[] } | null>(null);
  const handleOpenMediaTargets = (media: Media) => setTargetsToShow({ kind: 'media', offices: media.Offices ?? [] });
  const handleOpenSentenceTargets = (sentence: Sentence) => setTargetsToShow({ kind: 'sentence', offices: sentence.Offices ?? [] });
  const handleCloseTargets = () => setTargetsToShow(null);
  const togglePublishOfficeId = (id: number) => {
    setPublishOfficeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const resetPublishOfficeIds = () => setPublishOfficeIds(new Set());
  const [openBulkDeleteConfirm, setOpenBulkDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'medias' | 'sentences'>('medias');

  const handleOpenBulkPublish = () => {
    const unpublished = (fetchedMedias ?? []).filter((m) => !m.selected);
    setIdsToPublish(new Set(unpublished.map((m) => m.id)));
    resetPublishOfficeIds();
    setOpenBulkPublish(true);
  };

  const handleCloseBulkPublish = () => {
    setOpenBulkPublish(false);
    resetPublishOfficeIds();
  };

  const toggleIdToPublish = (id: number) => {
    setIdsToPublish((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectedMedia = (id: number) => {
    setSelectedMediaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenBulkDeleteConfirm = () => setOpenBulkDeleteConfirm(true);
  const handleCloseBulkDeleteConfirm = () => setOpenBulkDeleteConfirm(false);

  const handleOpenEditTime = (media: Media) => {
    setMediaToRemove(media);
    setValue(media.playTime);
    setOpenEditTime(true);
  };

  const handleCloseEditTime = () => {
    setOpenEditTime(false);
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

  const handleOpenPreviewMedia = (media: Media) => {
    setMediaToRemove(media);
    setOpenPreviewMedia(true);
  };

  const handleClosePreviewMedia = () => {
    setMediaToRemove(mediaToDelete);
    setOpenPreviewMedia(false);
  };

  const handleOpenUnpreviewMedia = (media: Media) => {
    setMediaToRemove(media);
    setOpenUnpreviewMedia(true);
  };

  const handleCloseUnpreviewMedia = () => {
    setMediaToRemove(mediaToDelete);
    setOpenUnpreviewMedia(false);
  };

  const handleOpenPublishMedia = (media: Media) => {
    setMediaToRemove(media);
    resetPublishOfficeIds();
    setOpenPublishMedia(true);
  };

  const handleClosePublishMedia = () => {
    setMediaToRemove(mediaToDelete);
    setOpenPublishMedia(false);
    resetPublishOfficeIds();
  };

  const handleOpenUnpublishMedia = (media: Media) => {
    setMediaToRemove(media);
    setOpenUnpublishMedia(true);
  };

  const handleCloseUnpublishMedia = () => {
    setMediaToRemove(mediaToDelete);
    setOpenUnpublishMedia(false);
  };

  const handleOpenPreviewSentence = (sentence: Sentence) => {
    setSentenceToUpdate(sentence);
    setOpenPreviewSentence(true);
  };

  const handleClosePreviewSentence = () => {
    setSentenceToUpdate(sentenceToDelete);
    setOpenPreviewSentence(false);
  };

  const handleOpenUnpreviewSentence = (sentence: Sentence) => {
    setSentenceToUpdate(sentence);
    setOpenUnpreviewSentence(true);
  };

  const handleCloseUnpreviewSentence = () => {
    setSentenceToUpdate(sentenceToDelete);
    setOpenUnpreviewSentence(false);
  };

  const handleOpenPublishSentence = (sentence: Sentence) => {
    setSentenceToUpdate(sentence);
    resetPublishOfficeIds();
    setOpenPublishSentence(true);
  };

  const handleClosePublishSentence = () => {
    setSentenceToUpdate(sentenceToDelete);
    setOpenPublishSentence(false);
    resetPublishOfficeIds();
  };

  const handleOpenUnpublishSentence = (sentence: Sentence) => {
    setSentenceToUpdate(sentence);
    setOpenUnpublishSentence(true);
  };

  const handleCloseUnpublishSentence = () => {
    setSentenceToUpdate(sentenceToDelete);
    setOpenUnpublishSentence(false);
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

  const togglePreviewMedia = async (close: () => void) => {
    try {
      close();
      setLoading(true);
      const res = await axiosAuth.put(`${url}/visual-display/${mediaToRemove.id}`);
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

  const publishMedia = async () => {
    try {
      const officeIds = Array.from(publishOfficeIds);
      handleClosePublishMedia();
      setLoading(true);
      const res = await axiosAuth.put(`${url}/publish/${mediaToRemove.id}`, { officeIds });
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

  const unpublishMedia = async () => {
    try {
      handleCloseUnpublishMedia();
      setLoading(true);
      const res = await axiosAuth.put(`${url}/${mediaToRemove.id}`);
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

  const bulkPublishMedias = async () => {
    try {
      const ids = Array.from(idsToPublish);
      if (ids.length === 0) return;
      const officeIds = Array.from(publishOfficeIds);
      handleCloseBulkPublish();
      setLoading(true);
      const res = await axiosAuth.put(`${url}/publish`, { ids, officeIds });
      if (res.status == 200) {
        toast.success('Publication en masse réussie!', { duration: 3000, className: " text-xs" });
        mutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
    }
  }

  const bulkDeleteMedias = async () => {
    try {
      const ids = Array.from(selectedMediaIds);
      if (ids.length === 0) return;
      handleCloseBulkDeleteConfirm();
      setLoading(true);
      const res = await axiosAuth.delete(`${url}/`, { data: { ids } });
      if (res.status == 200) {
        toast.success('Suppression en masse réussie!', { duration: 3000, className: " text-xs" });
        setSelectedMediaIds(new Set());
        mutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
    }
  }

  const togglePreviewSentence = async (close: () => void) => {
    try {
      close();
      setLoading(true);
      const res = await axiosAuth.put(`${urlSentences}/visual-display/${sentenceToUpdate.id}`);
      if (res.status == 200) {
        toast.success('Opération réussie!', { duration: 3000, className: " text-xs" });
        sentencesMutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
    }
  }

  const publishSentence = async () => {
    try {
      const officeIds = Array.from(publishOfficeIds);
      handleClosePublishSentence();
      setLoading(true);
      const res = await axiosAuth.put(`${urlSentences}/publish/${sentenceToUpdate.id}`, { officeIds });
      if (res.status == 200) {
        toast.success('Publication réussie!', { duration: 3000, className: " text-xs" });
        sentencesMutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
    }
  }

  const unpublishSentence = async () => {
    try {
      handleCloseUnpublishSentence();
      setLoading(true);
      const res = await axiosAuth.put(`${urlSentences}/${sentenceToUpdate.id}`);
      if (res.status == 200) {
        toast.success('Publication retirée!', { duration: 3000, className: " text-xs" });
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

  // Upload direct GCS (URL signée) : contourne la limite 32 Mio de Cloud Run.
  // 1) demande des URLs signées, 2) PUT chaque fichier DIRECTEMENT dans GCS
  // (axios brut, sans Authorization ni baseURL), 3) finalise (enregistrement +
  // notification des bornes).
  const onSubmit = async () => {
    try {
      if (selectedFiles.length === 0) return;
      setUploadProgress(0);
      setUploadMessageIdx(0);
      setAddLoading(true);

      // 1. URLs signées
      const { data: signed } = await axiosAuth.post<
        { uploadUrl: string; objectName: string; fileUrl: string; contentType: string }[]
      >(`${url}/signed-urls`, {
        files: selectedFiles.map((f) => ({ name: f.name, type: f.type })),
      });

      // 2. PUT direct vers GCS, progression agrégée sur tous les fichiers.
      const totalBytes = selectedFiles.reduce((s, f) => s + f.size, 0) || 1;
      const loadedByIdx = new Array(selectedFiles.length).fill(0);
      await Promise.all(
        selectedFiles.map((f, i) =>
          axios.put(signed[i].uploadUrl, f, {
            headers: { 'Content-Type': signed[i].contentType },
            onUploadProgress: (e) => {
              loadedByIdx[i] = e.loaded ?? 0;
              const loaded = loadedByIdx.reduce((a: number, b: number) => a + b, 0);
              setUploadProgress(Math.min(99, Math.round((loaded * 100) / totalBytes)));
            },
          }),
        ),
      );

      // 3. Finalisation : enregistrement + notification des bornes.
      const res = await axiosAuth.post(`${url}/finalize`, {
        items: signed.map((s, i) => ({ objectName: s.objectName, type: selectedFiles[i].type })),
      });
      setUploadProgress(100);
      if (res.status == 201) {
        toast.success('Opération réussie!', { duration: 3000, className: " text-xs" });
        mutate();
        sentencesMutate();
        handleClose();
      }
    }
    catch (error: any) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setAddLoading(false);
      setUploadProgress(0);
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

  const uploadingContent = (
    <div className="flex flex-col items-center justify-center gap-6 py-12 px-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-32 h-32 rounded-full bg-black/10 animate-ping"></div>
        <div className="absolute w-24 h-24 rounded-full bg-green-500/30 animate-pulse"></div>
        <div className="relative bg-black p-6 rounded-full shadow-lg shadow-black/40">
          <MdCloudUpload className="text-white animate-bounce" size={44} />
        </div>
      </div>

      <p className="text-xs font-medium text-gray-700 text-center min-h-[18px] transition-opacity duration-500">
        {uploadMessages[uploadMessageIdx]}
      </p>

      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  );

  const bodyContent = addLoading ? uploadingContent : (
    <div className="flex flex-col gap-3">
      <div {...getRootProps()} className=' w-full border-[2px] border-dotted border-gray-300 hover:border-gray-400 rounded-md p-4 text-center cursor-pointer'>
        <input {...getInputProps()} />
        <LuDownload className=" text-black mx-auto" size={48} />
        <p className=' text-gray-400 pt-2 text-xs'>
          {selectedFiles.length === 0
            ? "Choisissez un ou plusieurs fichiers (max 20) ou glissez-les ici."
            : `Cliquez ou glissez pour ajouter d'autres fichiers (${selectedFiles.length}/20)`}
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-2 max-h-72 overflow-auto">
          {selectedFiles.map((file, idx) => {
            const isImage = file.type.split('/')[0] === "image";
            const objectUrl = URL.createObjectURL(file);
            return (
              <div key={`${file.name}-${file.size}-${idx}`} className="relative rounded-md overflow-hidden border border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => removeSelectedFile(idx)}
                  title="Supprimer"
                  className=" absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
                >
                  <MdDelete size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(file)}
                  title="Aperçu"
                  className=" absolute top-1 left-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
                >
                  <FaEye size={11} />
                </button>
                {isImage
                  ? <img src={objectUrl} alt={file.name} className="h-24 w-full object-cover" />
                  : <video src={objectUrl} className="h-24 w-full object-cover" />}
                <p className='text-gray-500 p-1 text-[10px] truncate'>{file.name}</p>
              </div>
            );
          })}
        </div>
      )}

      {addLoading == false && selectedFiles.length > 0 && (
        <button className=' w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md' onClick={onSubmit}>
          Soumettre ({selectedFiles.length})
        </button>
      )}
    </div>
  )

  const bodySentenceContent = (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmitSentence)}>
      <textarea {...register("text")} placeholder="Entrer le texte" className=' rounded-md h-48 border-[1px] outline-none p-2 placeholder:text-xs'></textarea>
      <p className="text-xs text-red-500">{errors.text?.message}</p>
      {addLoading == false && <input className=" w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md" value="Soumettre" type="submit" />}
    </form>
  )

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
      <div className=' flex items-center justify-between mb-4'>
        <div className=' relative inline-flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm'>
          <button
            onClick={() => setActiveTab('medias')}
            className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'medias'
                ? 'bg-black text-white shadow-md'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <MdPermMedia size={16} /> Multimédias
            {fetchedMedias && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'medias' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {fetchedMedias.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sentences')}
            className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'sentences'
                ? 'bg-black text-white shadow-md'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <PiTextAUnderlineBold size={16} /> Textes déroulants
            {fetchedSentences && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'sentences' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {fetchedSentences.length}
              </span>
            )}
          </button>
        </div>
        {activeTab === 'medias' && (
          <div className=' flex items-center gap-2'>
            <button onClick={handleOpen} className=' bg-black hover:bg-gray-800 py-2 px-4 rounded-md text-white text-sm flex items-center gap-2'>
              <IoAddCircleOutline size={20} /> Ajouter un fichier
            </button>
            {fetchedMedias && fetchedMedias.some((m) => !m.selected) && (
              <button onClick={handleOpenBulkPublish} className=' bg-black hover:bg-gray-800 py-2 px-4 rounded-md text-white text-sm flex items-center gap-2'>
                <MdPublish size={20} /> Tout publier
              </button>
            )}
            {fetchedMedias && fetchedMedias.length > 0 && (
              <button
                onClick={handleOpenBulkDeleteConfirm}
                disabled={selectedMediaIds.size === 0}
                className=' bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed py-2 px-4 rounded-md text-white text-sm flex items-center gap-2'
              >
                <MdDelete size={20} /> Supprimer{selectedMediaIds.size > 0 ? ` (${selectedMediaIds.size})` : ''}
              </button>
            )}
          </div>
        )}
        {activeTab === 'sentences' && (
          <button onClick={handleOpenAddSentence} className=' bg-black hover:bg-gray-800 py-2 px-4 rounded-md text-white text-sm flex items-center gap-2'>
            <IoAddCircleOutline size={20} /> Ajouter un texte
          </button>
        )}
      </div>
      {activeTab === 'medias' && (
        fetchedMedias && fetchedMedias.length > 0 ?
          <>
            <div className="flex justify-center">
              <div className=' py-4 grid grid-cols-4 gap-8'>

                {fetchedMedias?.map((media, index) => {
                  const isSelectedForBulk = selectedMediaIds.has(media.id);
                  return (
                  <div key={media.id} className={`w-64 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border ${isSelectedForBulk ? 'border-red-500 ring-2 ring-red-300' : 'border-gray-100'}`}>
                    <div className="relative bg-gray-50">
                      {media.type === "image"
                        ? <img className="h-40 w-full object-cover" src={media.url} alt={`file${index}`} />
                        : <video className="h-40 w-full object-cover" controls>
                            <source src={media.url} type='video/mp4' />
                          </video>}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none">
                        {media.visuDisplay && (
                          <span className="bg-orange-500/90 text-white text-[10px] font-medium py-0.5 px-2 rounded-full shadow-sm backdrop-blur-sm">
                            En aperçu
                          </span>
                        )}
                        {media.selected && (
                          <span className="bg-blue-500/90 text-white text-[10px] font-medium py-0.5 px-2 rounded-full shadow-sm backdrop-blur-sm">
                            Publié
                          </span>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <span className="bg-black/60 text-white text-[10px] uppercase tracking-wide font-medium py-0.5 px-2 rounded-full backdrop-blur-sm">
                          {media.type}
                        </span>
                        <input
                          type="checkbox"
                          checked={isSelectedForBulk}
                          onChange={() => toggleSelectedMedia(media.id)}
                          title="Sélectionner pour suppression"
                          className=" w-4 h-4 cursor-pointer accent-red-600"
                        />
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="text-[11px] text-gray-500">
                        Ajouté le {format(new Date(media.createdAt), "dd MMMM yyyy", { locale: fr })}
                      </p>

                      <div className="flex items-center justify-between gap-1 mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => media.visuDisplay ? handleOpenUnpreviewMedia(media) : handleOpenPreviewMedia(media)}
                            title={media.visuDisplay ? "Retirer de l'aperçu" : "Mettre en aperçu"}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${media.visuDisplay
                              ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                          >
                            {media.visuDisplay ? <FaEyeSlash size={11} /> : <FaEye size={11} />}
                            <span>Aperçu</span>
                          </button>
                          <button
                            onClick={() => media.selected ? handleOpenUnpublishMedia(media) : handleOpenPublishMedia(media)}
                            title={media.selected ? "Annuler la publication" : "Publier sur le réseau"}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${media.selected
                              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                          >
                            {media.selected ? <MdUnpublished size={12} /> : <MdPublish size={12} />}
                            <span>{media.selected ? "Retirer" : "Publier"}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {media.selected && (
                            <button
                              onClick={() => handleOpenMediaTargets(media)}
                              title="Voir les agences ciblées"
                              className="p-1.5 rounded-md text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <MdInfoOutline size={14} />
                            </button>
                          )}
                          {media.type === "image" && (
                            <button
                              onClick={() => handleOpenEditTime(media)}
                              title="Temps de lecture"
                              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                            >
                              <MdOutlineTimer size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenDelete(media)}
                            title="Supprimer"
                            className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <MdDelete size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </>
          :
          <p className=' text-center text-xs'>Aucun fichier</p>
      )}

      {activeTab === 'sentences' && (
        fetchedSentences && fetchedSentences.length > 0 ?
          <div className=' py-4'>
            <table className="w-full table-fixed">
              <thead>
                <tr className="">
                  <th className=" w-12 py-4 text-left text-black text-xs font-semibold">No</th>
                  <th className="w-1/2 py-4 text-left text-black text-xs font-semibold">Texte</th>
                  <th className='w-1/4 py-4 text-left text-black text-xs font-semibold'>Diffusion</th>
                  <th className='w-8 py-4 text-left text-black text-xs font-semibold'> </th>
                  <th className='w-8 py-4 text-left text-black text-xs font-semibold'> </th>
                  <th className='w-8 py-4 text-left text-black text-xs font-semibold'> </th>
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
                        ? <FaEyeSlash onClick={() => handleOpenUnpreviewSentence(text)} size={18} className=" cursor-pointer text-orange-500" title="Retirer de l'aperçu" />
                        : <FaEye onClick={() => handleOpenPreviewSentence(text)} size={18} className=" cursor-pointer text-gray-700" title="Mettre en aperçu" />}
                    </td>
                    <td>
                      {text.selected
                        ? <MdUnpublished onClick={() => handleOpenUnpublishSentence(text)} size={20} className=" cursor-pointer text-red-500 hover:text-red-700" title="Annuler la publication" />
                        : <MdPublish onClick={() => handleOpenPublishSentence(text)} size={20} className=" cursor-pointer text-blue-500 hover:text-blue-700" title="Publier sur le réseau" />}
                    </td>
                    <td>
                      {text.selected && (
                        <MdInfoOutline onClick={() => handleOpenSentenceTargets(text)} size={18} className=" cursor-pointer text-gray-500 hover:text-blue-600" title="Voir les agences ciblées" />
                      )}
                    </td>
                    <td>
                      <MdDelete onClick={() => handleOpenDeleteSentence(text)} size={16} className=" cursor-pointer hover:text-red-500" />
                    </td>
                  </tr>
                ))
              }
            </table>
          </div> :
          <p className=' text-center text-xs'>Aucun texte</p>
      )}
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
        open={openPreviewMedia}
        onClose={handleClosePreviewMedia}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4 rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Mettre en aperçu</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous afficher ce contenu sur l&apos;afficheur d&apos;aperçu ?</p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={() => togglePreviewMedia(handleClosePreviewMedia)}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleClosePreviewMedia}>Non</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openUnpreviewMedia}
        onClose={handleCloseUnpreviewMedia}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4 rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Retirer de l&apos;aperçu</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous retirer ce contenu de l&apos;afficheur d&apos;aperçu ?</p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={() => togglePreviewMedia(handleCloseUnpreviewMedia)}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseUnpreviewMedia}>Non</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openPublishMedia}
        onClose={handleClosePublishMedia}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/3 max-w-md bg-white p-4 rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Publier</p>
          <p className=' text-xs text-center text-gray-600'>Choisissez les agences cibles, puis validez.</p>
          {officePicker}
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={publishMedia}>Publier</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleClosePublishMedia}>Annuler</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openUnpublishMedia}
        onClose={handleCloseUnpublishMedia}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4 rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Annuler la publication</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous retirer ce contenu du réseau d&apos;afficheurs ?</p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={unpublishMedia}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseUnpublishMedia}>Non</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openPreviewSentence}
        onClose={handleClosePreviewSentence}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4 rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Mettre en aperçu</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous afficher ce texte sur l&apos;afficheur d&apos;aperçu ?</p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={() => togglePreviewSentence(handleClosePreviewSentence)}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleClosePreviewSentence}>Non</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openUnpreviewSentence}
        onClose={handleCloseUnpreviewSentence}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4 rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Retirer de l&apos;aperçu</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous retirer ce texte de l&apos;afficheur d&apos;aperçu ?</p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={() => togglePreviewSentence(handleCloseUnpreviewSentence)}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseUnpreviewSentence}>Non</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openPublishSentence}
        onClose={handleClosePublishSentence}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/3 max-w-md bg-white p-4 rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Publier</p>
          <p className=' text-xs text-center text-gray-600'>Choisissez les agences cibles, puis validez.</p>
          {officePicker}
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={publishSentence}>Publier</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleClosePublishSentence}>Annuler</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openUnpublishSentence}
        onClose={handleCloseUnpublishSentence}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4 rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Annuler la publication</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous retirer ce texte du réseau d&apos;afficheurs ?</p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={unpublishSentence}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseUnpublishSentence}>Non</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-2/3 max-w-3xl bg-white p-4 rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold truncate mb-3'>{previewFile?.name}</p>
          {previewFile && (previewFile.type.split('/')[0] === "image"
            ? <img src={URL.createObjectURL(previewFile)} alt={previewFile.name} className=' max-h-[70vh] w-full object-contain rounded-md' />
            : <video src={URL.createObjectURL(previewFile)} controls autoPlay className=' max-h-[70vh] w-full rounded-md bg-black' />
          )}
        </div>
      </Modal>
      <Modal
        open={openBulkDeleteConfirm}
        onClose={handleCloseBulkDeleteConfirm}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4 rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Suppression</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous supprimer {selectedMediaIds.size} fichier{selectedMediaIds.size > 1 ? 's' : ''}&nbsp;?</p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={bulkDeleteMedias}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseBulkDeleteConfirm}>Non</button>
          </div>
        </div>
      </Modal>
      <Modal
        open={openBulkPublish}
        onClose={handleCloseBulkPublish}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-2/3 max-w-2xl bg-white p-4 rounded-lg mx-auto my-12 max-h-[85vh] overflow-auto'>
          <p className=' text-sm font-semibold py-2'>Publication en masse</p>
          <div className=' bg-orange-50 border border-orange-200 text-orange-700 p-3 rounded-md text-xs my-2'>
            Attention&nbsp;: le contenu sélectionné sera publié sur les agences ciblées (ou toutes si aucune n&apos;est sélectionnée).
          </div>
          {officePicker}
          <p className=' text-xs text-gray-600 mb-3'>Décochez les médias que vous ne souhaitez pas publier (tous sélectionnés par défaut).</p>
          {(fetchedMedias ?? []).filter((m) => !m.selected).length === 0 ? (
            <p className=' text-xs text-center text-gray-500 py-4'>Tous les médias sont déjà publiés.</p>
          ) : (
            <div className=' grid grid-cols-3 gap-3'>
              {(fetchedMedias ?? []).filter((m) => !m.selected).map((media) => {
                const checked = idsToPublish.has(media.id);
                return (
                  <label
                    key={media.id}
                    className={`relative cursor-pointer rounded-md border-2 overflow-hidden transition-all ${checked ? 'border-black' : 'border-gray-200 opacity-50'}`}
                  >
                    <input
                      type='checkbox'
                      checked={checked}
                      onChange={() => toggleIdToPublish(media.id)}
                      className=' absolute top-2 right-2 w-4 h-4 z-10 cursor-pointer accent-black'
                    />
                    {media.type === 'image' ? (
                      <img src={media.url} alt={`media-${media.id}`} className=' h-24 w-full object-cover' />
                    ) : (
                      <video className=' h-24 w-full object-cover'>
                        <source src={media.url} type='video/mp4' />
                      </video>
                    )}
                    <div className=' text-[10px] p-1 text-center text-gray-600'>
                      {format(new Date(media.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
          <div className=' py-4 flex items-center justify-end gap-3'>
            <button className=' bg-white border border-black text-black hover:bg-gray-100 text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseBulkPublish}>Annuler</button>
            <button
              disabled={idsToPublish.size === 0}
              className=' bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-3 rounded-md'
              onClick={bulkPublishMedias}
            >
              Publier ({idsToPublish.size})
            </button>
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
            const offices = targetsToShow.offices;
            const label = targetsToShow.kind === 'media' ? 'ce média' : 'ce texte';
            if (offices.length === 0) {
              return (
                <div className=' bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md text-xs text-center'>
                  Diffusion globale&nbsp;: {label} est publié sur <strong>toutes les agences</strong>.
                </div>
              );
            }
            return (
              <>
                <p className=' text-xs text-gray-600 mb-2'>{label.charAt(0).toUpperCase() + label.slice(1)} est diffusé uniquement sur les agences suivantes&nbsp;:</p>
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