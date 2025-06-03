"use client";
import useChangeHeaderTitle from '@/app/hooks/useChangedHeader';
import { Menu, MenuItem, Modal } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { IoAddCircleOutline, IoSearchOutline } from "react-icons/io5";
import { toast } from 'react-hot-toast';
import * as zod from "zod";
import { useForm } from 'react-hook-form';
import { BsFillTelephoneFill, BsPerson, BsPersonCircle } from 'react-icons/bs';
import { zodResolver } from '@hookform/resolvers/zod';
import MyModal from '@/components/Modal';
import { MdDelete, MdEdit, MdOutlineAlternateEmail, MdPower, MdPowerOff } from 'react-icons/md';
import Loader from '@/components/common/Loader';
import { CiFilter } from 'react-icons/ci';
import { AiFillCloseCircle } from 'react-icons/ai';
import { FiEdit3 } from 'react-icons/fi';
import { TbTallymark4 } from 'react-icons/tb';
import useAxiosAuth from '@/hooks/useAxiosAuth';
import useSWR from 'swr';
import { PiBuildingOfficeBold } from 'react-icons/pi';

const schema = zod.object({
  username: zod.string(
    {
      required_error: "l'email' est obligatoire",
      invalid_type_error: "entrez un email valide"
    }
  ).min(2, { message: "Le nom est obligatoire" }),
  name: zod.string({
    required_error: "le nom est obligatoire"
  }).min(2, { message: "Le nom est obligatoire" }),
  phone: zod.string({
    required_error: ""
  }).optional(),
  role_id: zod.number({
    required_error: "le role est obligatoire",
    invalid_type_error: "le role est obligatoire"
  }).min(1, { message: "le role est obligatoire" }),
  office_id: zod.any().optional(),

}).required();
type FormData = zod.infer<typeof schema>;

const updateSchema = zod.object({
  id: zod.number({}).optional(),
  active: zod.any({}).optional(),
  username: zod.string(
    {
      required_error: "l'email' est obligatoire",
      invalid_type_error: "entrez un email valide"
    }
  ).min(2, { message: "Le nom est obligatoire" }),
  name: zod.string({
    required_error: "le nom est obligatoire"
  }).min(2, { message: "Le nom est obligatoire" }),
  phone: zod.string({
    required_error: ""
  }).optional(),
  role_id: zod.number({
    required_error: "le role est obligatoire",
    invalid_type_error: "le role est obligatoire"
  }).min(1, { message: "le role est obligatoire" }),
  office_id: zod.any().optional(),
}).required();
type UpdateFormData = zod.infer<typeof updateSchema>;

const Admins = () => {
  const axiosAuth = useAxiosAuth();
  const url = `/role`;
  const userUrl = `/user`;
  const officeUrl = `/office`;
  const { data: fetchedUsers, isLoading, error, mutate } = useSWR(userUrl, () => axiosAuth.get<User[]>(userUrl).then((res) => res.data));
  const { data: fetchedRoles, isLoading: fetchRoleLoading, error: fetchRoleError, mutate: mutateRole } = useSWR(url, () => axiosAuth.get<Role[]>(url).then((res) => res.data));
  const { data: fetchedOffices, isLoading: fetchOfficesLoading, error: fetchOfficeError } = useSWR(officeUrl, () => axiosAuth.get<Office[]>(officeUrl).then((res) => res.data));
  const fetchUsers: User[] = [];
  const useChangeTitle = useChangeHeaderTitle();
  const [allUserList, setAllUserList] = useState(fetchUsers);
  const [userList, setUserList] = useState(fetchUsers);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (e: any) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredUsers = fetchedUsers!.filter((user) =>
      user.name.toLowerCase().includes(searchTerm)
    );
    setUserList(filteredUsers);
  };

  const userToDelete: User = {
    id: 0,
    name: '',
    username: '',
    role: {
      id: 0,
      name: '',
      createdAt: new Date()
    },
    Role: {
      id: 0,
      name: '',
      createdAt: new Date()
    },
    phone: '',
    active: false,
    createdAt: new Date(),
    office_id: 0
  };

  const [userToUpdate, setUserToUpdate] = useState(userToDelete);


  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const { register: updateRegister, handleSubmit: updateHandleSubmit, reset: updateRest, formState: { errors: updateError } } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema)
  });


  useEffect(() => {
    useChangeTitle.onChanged("Utilisateurs");
    if (fetchedUsers) {
      setAllUserList(fetchedUsers);
      setUserList(fetchedUsers);
    }
  }, [fetchedUsers]);

  const onSubmit = useCallback(async (data: FormData) => {
    try {
      const isUser = fetchedRoles!.find((role) => role.id === data.role_id);
      console.log('isUser', isUser);

      if (isUser && isUser.name === 'user' && !data.office_id) {
        toast.error('Sélectionner une agence pour cet utilisateur!', { duration: 3000, className: " text-xs" });
        return;
      }
      setAddLoading(true);
      const res = await axiosAuth.post(`${userUrl}/register`, data);
      if (res.status == 201) {
        reset();
        toast.success('un utilisateur a été ajouté avec succés!', { duration: 3000, className: " text-xs" });
        mutate();
      }
    }
    catch (error: any) {
      console.log('error', error);

      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setAddLoading(false);
    }
  }, [reset, setAddLoading]);

  const handleOpenEdit = (user: User) => {
    setUserToUpdate(user);
    setOpenEdit(true);
  }

  const handleCloseEdit = () => {
    updateRest();
    setUserToUpdate(userToDelete)
    setOpenEdit(false);
  };

  const onUpdate = useCallback(async (data: UpdateFormData) => {
    try {
      setEditLoading(true);
      data.active = userToUpdate.active;

      const res = await axiosAuth.put(userUrl, data);
      if (res.status == 200) {
        reset();
        toast.success('Modification réussie!', { duration: 3000, className: " text-xs" });
        mutate();
      }
    }
    catch (error: any) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      reset();
      setEditLoading(false);
      handleCloseEdit();
    }
  }, [setEditLoading, userToUpdate, reset, handleCloseEdit]);

  const [anchorElFilter, setAnchorElFilter] = useState(null);
  const openMenuFilter = Boolean(anchorElFilter);

  const handleClickFilter = (event: any) => {
    setAnchorElFilter(event.currentTarget);
  };

  const handleFilterActive = () => {
    const filteredUsers = allUserList!.filter((user) => user.active);
    setUserList(filteredUsers);
    setAnchorElFilter(null);
  };

  const handleFilterUnactive = () => {
    const filteredUsers = allUserList!.filter((user) => user.active === false);
    setUserList(filteredUsers);
    setAnchorElFilter(null);
  };

  const handleFilterAll = () => {
    setUserList(fetchedUsers!);
    setAnchorElFilter(null);
  };

  const handleCloseMenuFilter = () => {
    setAnchorElFilter(null);
  };

  const [openDelete, setOpenDelete] = useState(false);
  const [openActive, setOpenActive] = useState(false);
  const [openUnactive, setOpenUnactive] = useState(false);

  const [userToRemove, setUserToRemove] = useState(userToDelete);

  const handleOpenDelete = (user: User) => {
    setUserToRemove(user);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setUserToRemove(userToDelete);
    setOpenDelete(false);
  };

  const handleOpenActive = (user: User) => {
    setUserToRemove(user);
    setOpenActive(true);
  };

  const handleCloseActive = () => {
    setUserToRemove(userToDelete);
    setOpenActive(false);
  };

  const handleOpenUnactive = (user: User) => {
    setUserToRemove(user);
    setOpenUnactive(true);
  };

  const handleCloseUnactive = () => {
    setUserToRemove(userToDelete);
    setOpenUnactive(false);
  };

  const deleteUser = async () => {
    try {
      handleCloseDelete();
      setLoading(true);
      const res = await axiosAuth.delete(`${userUrl}/${userToRemove.id}`);
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
  const [userType, setUserType] = useState('');

  const renderTargetField = () => {
    switch (userType) {
      case "user":
        return (
          <select className='flex items-center border border-gray-100 rounded-lg dark:border-black p-3 text-xs  placeholder:text-gray-100 focus:outline-gray'
            {...register("office_id", { valueAsNumber: true })} >
            <option value="" selected>Sélectionner une agence</option>
            {
              fetchedOffices?.map((office) => (
                <option key={office.id} value={office.id}>
                  <>
                    <p>{office.name}</p>
                  </>
                </option>
              ))
            }
          </select>
        );
      default:
        return null;
    }
  };

  const activeUser = async () => {
    try {
      handleCloseActive();
      setLoading(true);
      const res = await axiosAuth.put(`${userUrl}/${userToRemove.id}`);
      if (res.status == 200) {
        reset();
        toast.success('Activation réussie!', { duration: 3000, className: " text-xs" });
        mutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
    }
  }

  const unActiveUser = async () => {
    try {
      handleCloseUnactive();
      setLoading(true);
      const res = await axiosAuth.put(`${userUrl}/${userToRemove.id}`);
      if (res.status == 200) {
        reset();
        toast.success('Désactivation réussie!', { duration: 3000, className: " text-xs" });
        mutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
    }
  }

  const bodyContent = (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center border border-gray rounded dark:border-gray  p-3 text-xs placeholder:text-gray focus:outline-gray">
        <span className="pr-2">
          <MdOutlineAlternateEmail className="h-3 w-3 text-black" />
        </span>
        <input
          className="flex-1 focus:outline-none"
          type="text"
          placeholder="Nom utilisateur"
          {...register("username")}
        />
      </div>
      <p className="text-xs text-red-500">{errors.username?.message}</p>

      <div className="flex items-center border border-gray rounded dark:border-gray p-3 text-xs placeholder:text-gray focus:outline-gray">
        <span className=" pr-2">
          <BsPerson className="h-3 w-3 text-black" />
        </span>
        <input
          className="flex-1 focus:outline-none"
          type="text"
          placeholder="Nom complet"
          {...register("name")}
        />
      </div>
      <p className=" text-xs text-red-500">{errors.name?.message}</p>

      <div className="flex items-center border border-gray rounded dark:border-gray p-3 text-xs placeholder:text-gray focus:outline-gray">
        <span className=" pr-2">
          <BsFillTelephoneFill className="h-3 w-3 text-black" />
        </span>
        <input
          className="flex-1 focus:outline-none"
          type="text"
          placeholder="Téléphone"
          {...register("phone")}
        />
      </div>
      <p className=" text-xs text-red-500">{errors.phone?.message}</p>

      <select className='flex items-center border border-gray rounded dark:border-gray p-3 text-xs  placeholder:text-gray-100 focus:outline-gray'
        {...register("role_id", {
          valueAsNumber: true, onChange: (e) => setUserType(
            fetchedRoles?.find(role => role.id === parseInt(e.target.value))?.name.toLocaleLowerCase() || ''
          )
        })} >
        <option value="" selected>Sélectionner le rôle</option>
        {
          fetchedRoles?.map((role) => (
            <option key={role.id} value={role.id}>
              <>
                {role.name.toLocaleLowerCase() === "root" && <p>administrateur</p>}
                {role.name.toLocaleLowerCase() === "admin" && <p>superviseur</p>}
                {role.name.toLocaleLowerCase() === "marketing" && <p>marketing et communication</p>}
                {role.name.toLocaleLowerCase() === "user" && <p>Chef d&apos;agence</p>}
              </>
            </option>
          ))
        }
      </select>
      <p className=" text-xs text-red-500">{errors.role_id?.message}</p>
      {userType && renderTargetField()}
      {addLoading == false && <input className=" w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md" value="Soumettre" type="submit" />}
    </form>
  );

  const bodyEditContent = (
    <form className="flex flex-col gap-2" onSubmit={updateHandleSubmit(onUpdate)}>
      <input
        type="hidden"
        value={userToUpdate.id}
        {...updateRegister("id", { valueAsNumber: true })}
      />
      <input
        type="hidden"
        {...updateRegister("active")}
      />
      <div className="flex items-center border border-gray rounded dark:border-gray  p-3 text-xs placeholder:text-gray focus:outline-gray">
        <span className="pr-2">
          <MdOutlineAlternateEmail className="h-3 w-3 text-black" />
        </span>
        <input
          className="flex-1 focus:outline-none text-black"
          type="text"
          placeholder="Nom utilisateur"
          defaultValue={userToUpdate.username}
          {...updateRegister("username")}
        />
      </div>
      <p className="text-xs text-red-500">{updateError.username?.message}</p>

      <div className="flex items-center border border-gray rounded dark:border-gray p-3 text-xs placeholder:text-gray focus:outline-gray">
        <span className=" pr-2">
          <BsPerson className="h-3 w-3 text-black" />
        </span>
        <input
          className="flex-1 focus:outline-none"
          type="text"
          placeholder="Nom complet"
          defaultValue={userToUpdate.name}
          {...updateRegister("name")}
        />
      </div>
      <p className=" text-xs text-red-500">{updateError.name?.message}</p>

      <div className="flex items-center border border-gray rounded dark:border-gray p-3 text-xs placeholder:text-gray focus:outline-gray">
        <span className=" pr-2">
          <BsFillTelephoneFill className="h-3 w-3 text-black" />
        </span>
        <input
          className="flex-1 focus:outline-none"
          type="text"
          placeholder="Téléphone"
          defaultValue={userToUpdate.phone}
          {...updateRegister("phone")}
        />
      </div>
      <p className=" text-xs text-red-500">{updateError.phone?.message}</p>

      <select
        defaultValue={userToUpdate.Role.id}
        {...updateRegister("role_id", { valueAsNumber: true })}
        className='flex items-center border border-gray rounded dark:border-gray p-3 text-xs  placeholder:text-gray-100 focus:outline-gray' >
        <option value={userToUpdate.Role.id} selected>
          <>
            {userToUpdate.Role.name.toLocaleLowerCase() === "root" && <p>administrateur</p>}
            {userToUpdate.Role.name.toLocaleLowerCase() === "admin" && <p>superviseur</p>}
            {userToUpdate.Role.name.toLocaleLowerCase() === "marketing" && <p>marketing et communication</p>}
          </>
        </option>
        {
          fetchedRoles?.map((role) => (
            role.name !== "user" && <option key={role.id} value={role.id}>
              <>
                {role.name.toLocaleLowerCase() === "root" && <p>administrateur</p>}
                {role.name.toLocaleLowerCase() === "admin" && <p>superviseur</p>}
                {role.name.toLocaleLowerCase() === "marketing" && <p>marketing et communication</p>}
              </>
            </option>
          ))
        }
      </select>
      <p className=" text-xs text-red-500">{updateError.role_id?.message}</p>
      {editLoading == false && <input className=" w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md" value="Soumettre" type="submit" />}
    </form>
  )

  if (isLoading || fetchRoleLoading || loading || allUserList.length == 0 || fetchOfficesLoading) {
    return <Loader />
  }

  return (
    <div className=' bg-slate-100 h-screen  w-full rounded-t-xl p-4'>
      <button onClick={handleOpen} className='  bg-black py-2 px-4 rounded-md text-white text-sm flex items-center gap-2'><IoAddCircleOutline size={20} /> Ajouter Utilisateur</button>
      {
        allUserList.length > 0 ?
          <div className=' py-4'>
            <div className="flex items-center justify-between">
              <div>
                <p className=' text-sm font-semibold'>Utilisateurs</p>
              </div>
              <div className=' flex items-center justify-center gap-2 w-1/3'>
                <div className=" grow w-full flex items-center bg-white border rounded-lg pl-3">
                  <IoSearchOutline />
                  <input
                    type="text"
                    placeholder="Rechercher par nom..."
                    onChange={handleInputChange}
                    className=" w-full px-2 py-2 placeholder:text-xs text-xs bg-transparent focus:outline-none"
                  />
                </div>
                <button className=' bg-white text-xs flex gap-2 items-center rounded-md py-2 px-3' aria-controls="fade-menu-filter" aria-haspopup="true" onClick={handleClickFilter}>
                  <CiFilter />
                  <p className=' font-semibold' >Filtrer</p>

                </button>
                <Menu
                  id="fade-menu-filter"
                  anchorEl={anchorElFilter}
                  keepMounted
                  open={openMenuFilter}
                  onClose={handleCloseMenuFilter}
                  className=' rounded-xl'
                >
                  <MenuItem onClick={handleFilterAll} className=' bg-gray-200 text-gray-500 mx-2 my-1 rounded-full text-xs flex items-center gap-2 hover:bg-orange-500 hover:text-white'><TbTallymark4 size={18} /> Tout</MenuItem>
                  <MenuItem onClick={handleFilterActive} className=' bg-green-200 text-green-500 mx-2 my-1 rounded-full text-xs flex items-center gap-2 hover:bg-orange-500 hover:text-white'><MdEdit size={18} /> Actif</MenuItem>
                  <MenuItem onClick={handleFilterUnactive} className=' bg-red-200 text-rose-500 mx-2 my-1 rounded-full text-xs flex items-center gap-2 hover:bg-orange-500 hover:text-white'><AiFillCloseCircle size={18} /> Inactif</MenuItem>
                </Menu>
              </div>
            </div>
            <table className="w-full table-fixed">
              <thead>
                <tr className="">
                  <th className="w-1/3 py-4 text-left text-black text-xs font-semibold">Utilisateur</th>
                  <th className="w-1/3 py-4 text-left text-black text-xs font-semibold">Status</th>
                  <th className="w-1/4 py-4 text-left text-black text-xs font-semibold">Role</th>
                  <th className="w-1/4 py-4 text-left text-black text-xs font-semibold">Telephone</th>
                  <th className=' w-8 py-4 text-left text-black text-xs font-semibold'> </th>
                  <th className=' w-8 py-4 text-left text-black text-xs font-semibold'> </th>
                  <th className=' w-8 py-4 text-left text-black text-xs font-semibold'> </th>
                </tr>
              </thead>
              {
                userList?.map((user) => (
                  <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className=' flex gap-2 p-2 items-center'>
                      <BsPersonCircle size={32} />
                      <div>
                        <p className=' text-xs font-semibold pb-1'>{user.name}</p>
                        <p className=' text-xs font-medium text-gray-400'>{user.username}</p>
                        {user.office &&
                          <div className=' flex items-start gap-1 pt-1'>
                            <PiBuildingOfficeBold className=' w-4 h-4' />
                            <p className=' capitalize text-xs font-medium text-gray-600'>{user.office.name}</p>
                          </div>}
                      </div>
                    </td>
                    <td className='text-xs'>
                      {
                        user.active === true ?
                          <p className=' w-fit bg-green-200 text-green-500 py-1 px-2 rounded-full'>
                            Actif
                          </p> :
                          <p className=' w-fit bg-red-200 text-red-500 py-1 px-2 rounded-full'>
                            Inactif
                          </p>
                      }
                    </td>
                    <td className=' text-xs'>
                      {<>
                        {user.Role.name.toLocaleLowerCase() === "root" && <p>super administrateur</p>}
                        {user.Role.name.toLocaleLowerCase() === "admin" && <p>Superviseur</p>}
                        {user.Role.name.toLocaleLowerCase() === "marketing" && <p>Marketing et communication</p>}
                        {user.Role.name.toLocaleLowerCase() === "user" && <p>Chef d&apos;agence</p>}
                      </>
                      }
                    </td>
                    <td className=' text-xs text-black'>{user.phone !== "" ? user.phone : <p>Pas de numéro</p>}</td>
                    <td>
                      <FiEdit3 size={16} onClick={() => handleOpenEdit(user)} className=" cursor-pointer" />
                    </td>
                    <td>
                      {user.active ? <MdPowerOff size={20} onClick={() => handleOpenUnactive(user)} className=" cursor-pointer text-red-500" /> : <MdPower size={20} onClick={() => handleOpenActive(user)} className=" cursor-pointer text-green-500" />}
                    </td>
                    <td>
                      <MdDelete size={16} onClick={() => handleOpenDelete(user)} className=" cursor-pointer hover:text-red-500" />
                    </td>
                  </tr>
                ))
              }
            </table>
          </div> :
          <p className=' text-center text-xs'>Aucun utilisateur</p>
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
          actionLabel='Ajouter utilisateur'
          title='Ajouter un utilisateur'
          isOpen={open}
          disabled={addLoading}
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
          actionLabel='Ajouter utilisateur'
          title='Ajouter un utilisateur'
          isOpen={openEdit}
          disabled={editLoading}
          body={bodyEditContent}
        />
      </Modal>
      <Modal
        open={openActive}
        onClose={handleCloseActive}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className=' w-1/4 bg-white p-4  rounded-lg mx-auto my-12'>
          <p className=' text-sm font-semibold py-2'>Activation</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous activer l&rsquo;utilisateur : {userToRemove.name} </p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={activeUser}>Oui</button>
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
          <p className=' text-sm font-semibold py-2'>Désactivation</p>
          <p className=' text-xs font-semibold text-center'>Voulez-vous désactiver l&rsquo;utilisateur : {userToRemove.name} </p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={unActiveUser}>Oui</button>
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
          <p className=' text-xs font-semibold text-center'>Voulez-vous supprimer le role: {userToRemove.name} </p>
          <div className=' py-4 flex items-center justify-center gap-3'>
            <button className=' bg-green-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={deleteUser}>Oui</button>
            <button className=' bg-red-500 text-white text-sm font-semibold py-2 px-3 rounded-md' onClick={handleCloseDelete}>Non</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Admins