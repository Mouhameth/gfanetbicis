"use client";

import MyModal from "@/components/Modal";
import Loader from "@/components/common/Loader";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { Modal } from "@mui/material";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { GoDotFill } from "react-icons/go";
import useSWR from "swr";
import { format } from 'date-fns';
import { fr } from "date-fns/locale/fr";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { io, Socket } from 'socket.io-client';


const Offices = () => {
  const url = `/office`;
  const SOCKET_URL = `https://bicis-360633557660.us-central1.run.app`;
  const axiosAuth = useAxiosAuth();
  const { data } = useSession();
  const { data: fetchedOffices, isLoading, mutate } = useSWR(url, () => axiosAuth.get<Office[]>(url).then((res) => res.data));
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
    });

    // Se connecter
    socketRef.current.connect();

    // Événement de connexion
    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      socketRef.current?.emit('msg', 'test');
    });

    socketRef.current.on('dataSent', (data) => {
      const {message} = data;
      toast.success(message, { duration: 3000, className: " text-xs" });
      setLoading(false)
    });

    // Nettoyage à la désactivation du composant
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

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
  const [openData, setOpenData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [formattedStartDate, setFormattedStartDate] = useState('');
  const [formattedEndDate, setFormattedEndDate] = useState('');

  const handleOpen = (office: Office) => {
    setOfficeToDelete(office);
    setOpen(true)
  }

  const handleClose = () => {
    setOfficeToDelete(emptyOffice);
    setOpen(false)
  };

  const handleOpenLoadData = (office: Office) => {
    setFormattedStartDate(format(startDate, 'dd/MM/yyyy'))
    setOfficeToDelete(office);
    setOpenData(true)
  }

  const handleCloseLoadData = () => {
    setOfficeToDelete(emptyOffice);
    setOpenData(false)
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

  const onChange = (dates: any) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setFormattedStartDate(format(start, 'dd/MM/yyyy'))
    if (end !== null) {
      setFormattedEndDate(format(end, 'dd/MM/yyyy'));
    }

  };

  const loadOneDate = async (date: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('loadOneDate', { officeId: officeToDelete.id, date });
      setLoading(true);
    } else {
      console.warn('Socket not connected yet');
      // Optionally try to reconnect
      socketRef.current?.connect();
    }
  }

  const loadMultipleDate = async (start: string, end: string) => {
     if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('loadMoreDate', { officeId: officeToDelete.id, start: start, end: end });
      setLoading(true);
    } else {
      console.warn('Socket not connected yet');
      // Optionally try to reconnect
      socketRef.current?.connect();
    }
  }

  const bodyContent = (
    <div className="">
      <h3 className=" text-xs font-semibold">Voulez-vous supprimer l&rsquo;agence {officeToDelete.name}</h3>
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

  const bodyContentData = (
    <div className=" flex flex-col justify-center items-center">
      <div >
        <DatePicker
          locale={fr}
          selected={startDate}
          onChange={onChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline
        />
      </div>
      <button onClick={() => {
        if (endDate === null) {
          loadOneDate(formattedStartDate);
        } else {
          loadMultipleDate(formattedStartDate, formattedEndDate);
        }
      }} className=" w-1/2 mt-4 bg-black text-xs text-white py-2 rounded-md hover:bg-green-500">Valider</button>
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
                    {['root'].includes(data?.user.role.name.toLowerCase() ?? "") && <td className='text-xs py-3 pr-12 text-justify flex items-center gap-2'>
                      <button onClick={() => handleOpen(office)} className=' text-xs bg-black p-2 rounded-md text-white hover:bg-red-500'>
                        Supprimer
                      </button>
                      <button onClick={() => handleOpenLoadData(office)} className=' text-xs bg-black p-2 rounded-md text-white hover:bg-blue-500'>
                        Synchroniser
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

      <Modal
        open={openData}
        onClose={handleCloseLoadData}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className=''
      >
        <MyModal
          onClose={handleCloseLoadData}
          actionLabel='Synchronisation des données'
          title={`Synchronisation des données de l'agence ${officeToDelete.name}`}
          isOpen={openData}
          disabled={loading}
          body={bodyContentData}
        />
      </Modal>
    </div>
  )
}

export default Offices