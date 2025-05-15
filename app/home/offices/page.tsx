"use client";

import MyModal from "@/components/Modal";
import Loader from "@/components/common/Loader";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { Modal } from "@mui/material";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { GoDotFill } from "react-icons/go";
import useSWR from "swr";


const Offices = () => {
  const url = `/office`;
  const axiosAuth = useAxiosAuth();
  const { data } = useSession();
  const { data: fetchedOffices, isLoading, mutate } = useSWR(url, () => axiosAuth.get<Office[]>(url).then((res) => res.data));

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
  const [officeToDelete, setOfficeToDelete] = useState(emptyOffice);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleOpen = (office: Office) => {
    setOfficeToDelete(office);
    setOpen(true)
  }
  const handleClose = () => {
    setOfficeToDelete(emptyOffice);
    setOpen(false)
  };


  const onDelete = async () => {
    try {
      setLoading(true);
      handleClose();

      const res = await axiosAuth.delete(`${url}/${officeToDelete.id}`);
      if (res.status == 200) {
        toast.success('Suppression réussie!', { duration: 3000, className: " text-xs" });
        mutate();
      }
    }
    catch (error: any) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setLoading(false);
    }
  }

  const bodyContent = (
    <div className="">
      <h3 className=" text-xs font-semibold">Voulez-vous supprimer l'agence {officeToDelete.name}</h3>
      <div className=" flex items-center justify-end mt-4 gap-3">
        <button onClick={handleClose} className=" w-28 text-xs bg-gray-300 p-2 rounded-md text-black hover:bg-gray-400">
          Non
        </button>
        <button onClick={onDelete} className=" w-28 text-xs bg-red-500 p-2 rounded-md text-white hover:bg-red-600">
          Oui
        </button>
      </div>
    </div>
  );


  if (isLoading || !fetchedOffices || loading) {
    return <Loader />
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
                  {['root'].includes(data?.user.role.name.toLowerCase() ?? "") && <th className='w-1/3 py-4 text-left text-black text-xs font-semibold'>Action</th>}

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
                    {['root'].includes(data?.user.role.name.toLowerCase() ?? "") && <td className='text-xs py-3 pr-12 text-justify'>
                      <button onClick={() => handleOpen(office)} className=' text-xs bg-black p-2 rounded-md text-white hover:bg-red-500'>
                        Supprimer
                      </button>
                    </td>}
                  </tr>
                ))
              }
            </table>
          </div> :
          <p className=' text-center text-xs'>Aucune agence</p>
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
          actionLabel='Suppression'
          title='Supprimer le site'
          isOpen={open}
          disabled={loading}
          body={bodyContent}
        />
      </Modal>
    </div>
  )
}

export default Offices