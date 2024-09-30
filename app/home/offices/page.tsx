"use client";

import MyModal from "@/components/Modal";
import Loader from "@/components/common/Loader";
import { axiosAuth } from "@/libs/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@mui/material";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaAddressBook, FaCity, FaFlag } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { LuDownload } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import { TbCircleLetterA } from "react-icons/tb";
import useSWR from "swr";
import * as zod from "zod";

const schema = zod.object({
  localname: zod.string({
    required_error: "le nom est boligatoire"
  }),
  country: zod.string({
    required_error: "le pays est boligatoire"
  }),
  city: zod.string({
    required_error: "la ville est boligatoire"
  }),
  location: zod.string({
    required_error: "l'adresse est boligatoire"
  })

}).required();
type FormData = zod.infer<typeof schema>;

const Offices = () => {
  const url = `/office`;
  const { data: fetchedOffices, isLoading, error, mutate } = useSWR(url, () => axiosAuth.get<Office[]>(url).then((res) => res.data));
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  const emptyOffice: Office = {
    id: 0,
    name: "",
    country: "",
    city: "",
    location: "",
    logo: "",
    createdAt: new Date(),
    localname: ""
  }
  const [officeToUpdate, setOfficeToUpdate] = useState(emptyOffice);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleOpen = (office: Office) => {
    setOfficeToUpdate(office);
    setOpen(true)
  }
  const handleClose = () => {
    setOfficeToUpdate(emptyOffice);
    setOpen(false)
  };
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": ['.png', '.PNG'],
      "image/jpg": [".jpg", ".JPG"],
      "image/jpeg": [".jpeg", ".JPEG"]
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

  const onUpdate = async (data: FormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      if (acceptedFiles.length > 0) {
        console.log(acceptedFiles[0]);

        formData.append("file", acceptedFiles[0]);
      }

      formData.append('id', officeToUpdate.id.toString());
      formData.append('name', officeToUpdate.name);
      formData.append('logo', officeToUpdate.logo);
      formData.append('country', data.country);
      formData.append('city', data.city);
      formData.append('location', data.location);
      formData.append('localname', data.localname);
      const res = await axiosAuth.put(`${url}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.status == 200) {
        reset();
        toast.success('Modification réussie!', { duration: 3000, className: " text-xs" });
        mutate();
      }
    }
    catch (error: any) {
      console.log(error);
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      reset();
      setLoading(false);
      handleClose();
    }
  }

  const bodyContent = (
    <form className="flex flex-col gap-2 " onSubmit={handleSubmit(onUpdate)}>
      <div {...getRootProps()} className=' w-full border-[2px] border-dotted border-gray-300 h-40 border-spacing-8 rounded-md p-4 text-center'>
        <input {...getInputProps()} />
        {
          acceptedFiles.length === 0 ?
            <>
              <LuDownload className=" text-black mx-auto" size={80} />
              <p className=' text-gray-400 p-4 text-xs'>Choisissez une image ou glisser la ici.</p>
            </>
            :
            <>
              {acceptedFiles.map((file: any) => (
                <div key={file.name} className="flex flex-col items-center">
                  <img className=' rounded-md' src={URL.createObjectURL(file)} alt={file.name} width={150} height={150} />
                  <p className='text-gray-400 p-3 text-xs'>{file.name}</p>
                </div>
              ))}
            </>
        }
        
      </div>
        <div className="flex items-center border border-gray rounded dark:border-gray  p-3 text-xs placeholder:text-gray focus:outline-gray">
          <span className="pr-2">
            <TbCircleLetterA className="h-3 w-3 text-black" />
          </span>
          <input
            className="flex-1 focus:outline-none text-black"
            type="text"
            placeholder="Nom"
            defaultValue={officeToUpdate.localname}
            {...register("localname")}
          />
        </div>
        <p className="text-xs text-red-500">{errors.localname?.message}</p>

        <div className="flex items-center border border-gray rounded dark:border-gray p-3 text-xs placeholder:text-gray focus:outline-gray">
          <span className=" pr-2">
            <FaFlag className="h-3 w-3 text-black" />
          </span>
          <input
            className="flex-1 focus:outline-none"
            type="text"
            placeholder="Pays"
            defaultValue={officeToUpdate.country}
            {...register("country")}
          />
        </div>
        <p className=" text-xs text-red-500">{errors.country?.message}</p>

        <div className="flex items-center border border-gray rounded dark:border-gray p-3 text-xs placeholder:text-gray focus:outline-gray">
          <span className=" pr-2">
            <FaCity className="h-3 w-3 text-black" />
          </span>
          <input
            className="flex-1 focus:outline-none"
            type="text"
            placeholder="Ville"
            defaultValue={officeToUpdate.city}
            {...register("city")}
          />
        </div>
        <p className=" text-xs text-red-500">{errors.city?.message}</p>

        <div className="flex items-center border border-gray rounded dark:border-gray p-3 text-xs placeholder:text-gray focus:outline-gray">
          <span className=" pr-2">
            <FaAddressBook className="h-3 w-3 text-black" />
          </span>
          <input
            className="flex-1 focus:outline-none"
            type="text"
            placeholder="Adresse"
            defaultValue={officeToUpdate.location}
            {...register("location")}
          />
        </div>
        <p className=" text-xs text-red-500">{errors.location?.message}</p>
      {loading == false && <input type="submit" className=' w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md' value="Soumettre" />}
    </form>
  )


  if (isLoading) {
    return <Loader />
  }

  if (error) {
    return <p>Vérifie votre connexion</p>
  }

  return (
    <div className=' bg-slate-100 h-screen  w-full rounded-t-xl p-4 overflow-auto'>
      {
        fetchedOffices ?
          <div className=' py-4'>
            <div className="flex items-center justify-between">
              <div>
                <p className=' text-sm font-semibold'>Agences</p>
              </div>
            </div>
            <table className="w-full table-fixed">
              <thead>
                <tr className="">
                  <th className=" w-48 py-4 text-left text-black text-xs font-semibold">No</th>
                  <th className="w-1/2 py-4 text-left text-black text-xs font-semibold">Nom</th>
                  <th className='w-1/3 py-4 text-left text-black text-xs font-semibold'>Adresse</th>
                  <th className='w-1/3 py-4 text-left text-black text-xs font-semibold'>Statut</th>
                  
                </tr>
              </thead>
              {
                fetchedOffices?.map((office, index) => (
                  <tr key={office.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className=' text-xs p-3'>
                      <p>{index + 1}</p>
                    </td>
                    <td className='text-xs py-3 pr-12 text-justify uppercase font-bold'>
                      <p>{office.name}</p>
                    </td>
                    <td className='text-xs py-3 pr-12 text-justify'>
                      <p>{office.location}</p>
                    </td>
                    <td className='text-xs py-3 pr-12 text-justify text-green-500'>
                      <GoDotFill />
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
          actionLabel='Modification'
          title='Modifier les informations du site'
          isOpen={open}
          disabled={loading}
          body={bodyContent}
        />
      </Modal>
    </div>
  )
}

export default Offices