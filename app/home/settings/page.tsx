"use client";
import useChangeHeaderTitle from '@/app/hooks/useChangedHeader';
import React, { useCallback, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from "zod";
import { FaKey, FaServer } from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";
import Loader from '@/components/common/Loader';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useSession } from 'next-auth/react';
import { PiTextAUnderlineBold } from "react-icons/pi";
import { IoAddCircleOutline } from 'react-icons/io5';
import { FiEdit3 } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
import { Modal } from '@mui/material';
import MyModal from '@/components/Modal';
import useSWR from "swr";
import useAxiosAuth from '@/hooks/useAxiosAuth';
import { GoDotFill } from 'react-icons/go';
import { HexColorPicker } from "react-colorful";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const schema = zod.object({
  initial: zod.string({
    required_error: "Le mot de passe est obligatoire"
  }).min(6, { message: "Le mot de passe doit comporter au moins 6 caractères" }),
  password: zod.string({
    required_error: "Le mot de passe est obligatoire"
  }).min(6, { message: "Le mot de passe doit comporter au moins 6 caractères" }),
  passwordConfirmation: zod.string({
    required_error: "Confirmer le mot de passe"
  })
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["passwordConfirmation"]
});

type FormData = zod.infer<typeof schema>;

const roleSchema = zod.object({
  id: zod.number({

  }).optional(),
  name: zod.string({
    required_error: "Le role est obligatoire"
  }).min(2, { message: "Le role doit comporter au moins 2 caractères" })
});

type RoleFormData = zod.infer<typeof roleSchema>;

const ipSchema = zod.object({
  id: zod.any().optional(),
  ip: zod.string({
    required_error: "L'adresse ip est obligatoire"
  }).min(7, { message: "L'adresse ip doit comporter au moins 7 caractères" })
});

type IpFormData = zod.infer<typeof ipSchema>;

const Setting = () => {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const url = `/role`;
  const userUrl = `/user`;
  const ipUrl = `/ip`;
  const colorUrl = `/color`;
  const { data: fetchedRoles, isLoading, error, mutate } = useSWR(url, () => axiosAuth.get<Role[]>(url).then((res) => res.data));
  const { data: fetchedIps, isLoading: ipLoading, error: ipError, mutate: ipMutate } = useSWR(ipUrl, () => axiosAuth.get<IpAdress[]>(ipUrl).then((res) => res.data));
  const { data: fetchedColors, isLoading: colorLoading, error: colorError, mutate: colorMutate } = useSWR(colorUrl, () => axiosAuth.get<Color[]>(colorUrl).then((res) => res.data));
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  const { register: registerIp, handleSubmit: handleSubmitIp, reset: resetIp, formState: { errors: errorsIp } } = useForm<IpFormData>({
    resolver: zodResolver(ipSchema)
  });
  const [openRoleForm, setOpenRoleForm] = useState(false);
  const [openRoleFormEdit, setOpenRoleFormEdit] = useState(false);
  const [openIp, setOpenIp] = useState(false);
  const [openIpEdit, setOpenIpEdit] = useState(false);
  const [openBackgoundColor, setOpenBackgoundColor] = useState(false);
  const [openColorEdit, setOpenColorEdit] = useState(false);
  const [openTextColor, setOpenTextColor] = useState(false);
  const [openTextColorEdit, setOpenTextColorEdit] = useState(false);
  const [openContainerColor, setOpenContainerColor] = useState(false);
  const [openContainerColorEdit, setOpenContainerColorEdit] = useState(false);
  const [addRoleLoading, setAddRoleLoading] = useState(false);
  const [editRoleLoading, setEditRoleLoading] = useState(false);
  const handleOpenRoleForm = () => setOpenRoleForm(true);
  const handleCloseRoleForm = () => setOpenRoleForm(false);
  const handleOpenIpForm = () => setOpenIp(true);
  const handleCloseIpForm = () => setOpenIp(false);
  const handleOpenContainerColorForm = () => setOpenContainerColor(true);
  const handleCloseContainerColorForm = () => setOpenContainerColor(false);
  const handleOpenTextColorForm = () => setOpenTextColor(true);
  const handleCloseTextColorForm = () => setOpenTextColor(false);
  const handleOpenBackgoundColorForm = () => setOpenBackgoundColor(true);
  const handleCloseBackgoundColorForm = () => setOpenBackgoundColor(false);

  const [color, setColor] = useState("");
  const roleToDelete: Role = {
    id: 0,
    name: '',
    createdAt: new Date()
  };

  const colorToDelete: Color = {
    id: 0,
    createdAt: new Date(),
    color: '',
    type: '',
    updatedAt: new Date()
  };

  const ipToDelete: IpAdress = {
    id: 0,
    ip: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const [roleToUpdate, setRoleToUpdate] = useState(roleToDelete);
  const [ipToUpdate, setIpToUpdate] = useState(ipToDelete);
  const [colorToUpdate, setColorToUpdate] = useState(colorToDelete);

  const { register: registerRole, handleSubmit: submitRole, reset: resetRoleForm, formState: { errors: roleError } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema)
  });

  const onSubmitRole = useCallback(async (data: RoleFormData) => {
    try {
      setAddRoleLoading(true);
      const res = await axiosAuth.post(url, data);
      if (res.status == 201) {
        reset();
        toast.success('un role a été ajouté avec succés!', { duration: 3000, className: " text-xs" });
        mutate();
      }
    }
    catch (error: any) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setAddRoleLoading(false);
      resetRoleForm();
    }
  },[resetRoleForm, setAddRoleLoading, axiosAuth, mutate, reset, url]);

  const onSubmitIp = useCallback(async (data: IpFormData) => {
    try {
      setAddRoleLoading(true);
      const res = await axiosAuth.post(ipUrl, data);
      if (res.status == 201) {
        toast.success('un adresse ip a été ajouté avec succés!', { duration: 3000, className: " text-xs" });
        mutate();
        ipMutate();
      }
    }
    catch (error: any) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setAddRoleLoading(false);
      resetIp();
      setOpenIp(false);
    }
  }, [resetIp, setAddRoleLoading, axiosAuth, ipMutate, ipUrl, mutate]);

  const onSubmitColor = async (type: string) => {
    try {
      setAddRoleLoading(true);
      const res = await axiosAuth.post(colorUrl, JSON.stringify({ color: color, type: type }));
      console.log(res);

      if (res.status == 201) {
        toast.success('une couleur a été ajouté avec succés!', { duration: 3000, className: " text-xs" });
        mutate();
        ipMutate();
        colorMutate();
      }
    }
    catch (error: any) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setAddRoleLoading(false);
      resetIp();
      setOpenBackgoundColor(false);
      setOpenContainerColor(false);
      setOpenTextColor(false);
      setColor('');
    }
  }

  const onUpdateColor = async () => {
    try {
      setAddRoleLoading(true);
      const res = await axiosAuth.put(colorUrl, JSON.stringify({ id: colorToUpdate.id, color: color, type: colorToUpdate.type }));
      console.log(res);

      if (res.status == 200) {
        toast.success('la couleur a été modifiée avec succés!', { duration: 3000, className: " text-xs" });
        mutate();
        ipMutate();
        colorMutate();
      }
    }
    catch (error: any) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setAddRoleLoading(false);
      resetIp();
      setOpenColorEdit(false);
    }
  }

  const [loading, setLoading] = useState(false);
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const roleBodyContent = (
    <form className="flex flex-col gap-2" onSubmit={submitRole(onSubmitRole)}>
      <div className="flex items-center border border-gray rounded dark:border-gray  p-3 text-xs placeholder:text-gray focus:outline-gray">
        <span className="pr-2">
          <PiTextAUnderlineBold className="h-3 w-3 text-black" />
        </span>
        <input
          className="flex-1 focus:outline-none"
          type="text"
          placeholder="Nom du role"
          {...registerRole("name")}
        />
      </div>
      <p className="text-xs text-red-500">{roleError.name?.message}</p>


      {addRoleLoading == false && <input className=" w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md" value="Soumettre" type="submit" />}
    </form>
  )

  const backgroundBodyContent = (
    <div className="flex flex-col gap-2">
      <div className=' w-full border-[2px] border-dotted border-gray-300 h-fit border-spacing-8 rounded-md p-4 text-center'>
        <HexColorPicker color={color} className=' mx-auto' onChange={setColor} />
      </div>
      {addRoleLoading == false && color.length != 0 && <button className=' w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md' onClick={() => onSubmitColor("background")} >Soumettre</button>}
    </div>
  )
  const backgroundBodyContentEdit = (
    <div className="flex flex-col gap-2">
      <div className=' w-full border-[2px] border-dotted border-gray-300 h-fit border-spacing-8 rounded-md p-4 text-center'>
        <HexColorPicker color={colorToUpdate.color} className=' mx-auto' onChange={setColor} />
      </div>
      {addRoleLoading === false && color.length != 0 && <button className=' w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md' onClick={onUpdateColor} >Soumettre</button>}
    </div>
  )
  const containerBodyContent = (
    <div className="flex flex-col gap-2">
      <div className=' w-full border-[2px] border-dotted border-gray-300 h-fit border-spacing-8 rounded-md p-4 text-center'>
        <HexColorPicker color={color} className=' mx-auto' onChange={setColor} />
      </div>
      {addRoleLoading == false && color.length != 0 && <button className=' w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md' onClick={() => onSubmitColor("container")} >Soumettre</button>}
    </div>
  )
  const containerBodyContentEdit = (
    <div className="flex flex-col gap-2">
      <div className=' w-full border-[2px] border-dotted border-gray-300 h-fit border-spacing-8 rounded-md p-4 text-center'>
        <HexColorPicker color={colorToUpdate.color} className=' mx-auto' onChange={setColor} />
      </div>
      {addRoleLoading === false && color.length != 0 && <button className=' w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md' onClick={onUpdateColor} >Soumettre</button>}
    </div>
  )
  const textBodyContent = (
    <div className="flex flex-col gap-2">
      <div className=' w-full border-[2px] border-dotted border-gray-300 h-fit border-spacing-8 rounded-md p-4 text-center'>
        <HexColorPicker color={color} className=' mx-auto' onChange={setColor} />
      </div>
      {addRoleLoading == false && color.length != 0 && <button className=' w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md' onClick={() => onSubmitColor("text")} >Soumettre</button>}
    </div>
  )
  const textBodyContentEdit = (
    <div className="flex flex-col gap-2">
      <div className=' w-full border-[2px] border-dotted border-gray-300 h-fit border-spacing-8 rounded-md p-4 text-center'>
        <HexColorPicker color={colorToUpdate.color} className=' mx-auto' onChange={setColor} />
      </div>
      {addRoleLoading === false && color.length != 0 && <button className=' w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md' onClick={onUpdateColor} >Soumettre</button>}
    </div>
  )
  const ipBodyContent = (
    <form className="flex flex-col gap-2" onSubmit={handleSubmitIp(onSubmitIp)}>
      <div className="flex items-center border border-gray rounded dark:border-gray  p-3 text-xs placeholder:text-gray focus:outline-gray">
        <span className="pr-2">
          <FaServer className="h-3 w-3 text-black" />
        </span>
        <input
          className="flex-1 focus:outline-none"
          type="text"
          placeholder="192.168.28.10"
          {...registerIp("ip")}
        />
      </div>
      <p className="text-xs text-red-500">{errorsIp.ip?.message}</p>


      {addRoleLoading == false && <input className=" w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md" value="Soumettre" type="submit" />}
    </form>
  )


  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const res = await axiosAuth.post(userUrl, data);
      if (res.status == 200) {
        reset();
        toast.success('Votre mot de passe a été changé avec succés!', { duration: 3000, className: " text-xs" });
        mutate();
      }
    }
    catch (error: any) {
      toast.error('Une erreur est survenue', { duration: 3000 });
    }
    finally {
      setLoading(false);
    }
  }
  const useChangeTitle = useChangeHeaderTitle();

  useEffect(() => {
    useChangeTitle.onChanged("Paramètre");
  }, []);

  const handleOpenRoleEdit = (role: Role) => {
    setRoleToUpdate(role);
    setOpenRoleFormEdit(true);
  }

  const handleCloseRoleEdit = () => {
    resetRoleForm();
    setRoleToUpdate(roleToDelete)
    setOpenRoleFormEdit(false);
  };

  const handleOpenColorEdit = (color: Color) => {
    setColorToUpdate(color);
    setOpenColorEdit(true);
  }

  const handleCloseColorEdit = () => {
    setColor("");
    resetRoleForm();
    setColorToUpdate(colorToDelete)
    setOpenColorEdit(false);
  };

  const handleOpenIpEdit = (ip: IpAdress) => {
    setIpToUpdate(ip);
    setOpenIpEdit(true);
  }

  const handleCloseIpEdit = () => {
    resetIp();
    setIpToUpdate(ipToDelete)
    setOpenIpEdit(false);
  };

  const onUpdateRole = useCallback(async (data: RoleFormData) => {
    try {
      setAddRoleLoading(true);
      const res = await axiosAuth.put(url, data);
      if (res.status == 200) {
        toast.success('Role modifié avec succés!', { duration: 3000, className: " text-xs" });
        mutate();
      }
    }
    catch (error: any) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setEditRoleLoading(false);
      handleCloseRoleEdit();
    }
  }, [setEditRoleLoading, roleToUpdate, resetRoleForm, handleCloseRoleEdit, axiosAuth, mutate, url]);

  const onUpdateIp = useCallback(async (data: IpFormData) => {
    try {
      setAddRoleLoading(true);
      const res = await axiosAuth.put(ipUrl, data);
      if (res.status == 200) {
        toast.success('Adresse Ip modifiée avec succés!', { duration: 3000, className: " text-xs" });
        mutate();
        ipMutate();
      }
    }
    catch (error: any) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    }
    finally {
      setEditRoleLoading(false);
      handleCloseIpEdit();
    }
  }, [setEditRoleLoading, ipToUpdate, handleCloseIpEdit, axiosAuth, ipMutate, ipUrl, mutate]);

  const bodyEditContent = (
    <form className="flex flex-col gap-2" onSubmit={submitRole(onUpdateRole)}>
      <input
        type="hidden"
        value={roleToUpdate.id}
        {...registerRole("id", { valueAsNumber: true })}
      />
      <div className="flex items-center border border-gray rounded dark:border-gray  p-3 text-xs placeholder:text-gray focus:outline-gray">
        <span className="pr-2">
          <PiTextAUnderlineBold className="h-3 w-3 text-black" />
        </span>
        <input
          className="flex-1 focus:outline-none text-black"
          type="text"
          placeholder="Nom du role"
          defaultValue={roleToUpdate.name}
          {...registerRole("name")}
        />
      </div>
      <p className="text-xs text-red-500">{roleError.name?.message}</p>

      {editRoleLoading == false && <input className=" w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md" value="Soumettre" type="submit" />}
    </form>
  )

  const bodyEditIpContent = (
    <form className="flex flex-col gap-2" onSubmit={handleSubmitIp(onUpdateIp)}>
      <input
        type="hidden"
        value={ipToUpdate.id}
        {...registerIp("id", { valueAsNumber: true })}
      />
      <div className="flex items-center border border-gray rounded dark:border-gray  p-3 text-xs placeholder:text-gray focus:outline-gray">
        <span className="pr-2">
          <FaServer className="h-3 w-3 text-black" />
        </span>
        <input
          className="flex-1 focus:outline-none text-black"
          type="text"
          placeholder="192.168.28.10"
          defaultValue={ipToUpdate.ip}
          {...registerIp("ip")}
        />
      </div>
      <p className="text-xs text-red-500">{errorsIp.ip?.message}</p>

      {editRoleLoading == false && <input className=" w-full bg-black mx-auto p-3 text-xs font-semibold text-white hover:bg-green-500 cursor-pointer rounded-md" value="Soumettre" type="submit" />}
    </form>
  )

  const [roleToRemove, setRoleToRemove] = useState(roleToDelete);
  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = (role: Role) => {
    setRoleToRemove(role);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setRoleToRemove(roleToDelete);
    setOpenDelete(false);
  };

  const deleteRole = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.delete(`${url}/${roleToRemove.id}`);
      if (res.status == 200) {
        reset();
        toast.success('Ce rôle a été supprimé avec succés!', { duration: 3000, className: " text-xs" });
        mutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
      handleCloseDelete();
    }
  }

  const [openIpDelete, setOpenIpDelete] = useState(false);
  const handleOpenIpDelete = (ip: IpAdress) => {
    setIpToUpdate(ip);
    setOpenIpDelete(true);
  };

  const handleCloseIpDelete = () => {
    setIpToUpdate(ipToDelete);
    setOpenIpDelete(false);
  };

  const deleteIp = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.delete(`${ipUrl}/${ipToUpdate.id}`);
      if (res.status == 200) {
        reset();
        toast.success("L'adresse ip a été supprimée avec succés!", { duration: 3000, className: " text-xs" });
        ipMutate();
      }
    } catch (error) {
      toast.error('Une erreur est survenue, réessayer!', { duration: 3000, className: " text-xs" });
    } finally {
      setLoading(false);
      handleCloseIpDelete();
    }
  }

  if (isLoading || !fetchedRoles || ipLoading || loading || colorLoading || loading) {
    return <Loader />
  }

  return (
    <div className=' bg-slate-100 h-screen  w-full rounded-t-xl'>
      <div className='flex flex-col justify-center items-center'>
                  <div className="  w-10 h-10 border-[1px] border-gray-500 flex justify-center rounded-md items-center text-gray-500">
                    <FaKey />
                  </div>
                  <p className=" text-lg font-bold text-gray-500 my-2">Choisir un mot de passe</p>
                  <p className=" text-sm text-gray-500">Le mot de passe doit comporter au moins 6 caractères</p>
                  <form className=" mx-auto" onSubmit={handleSubmit(onSubmit)}>

                    <div className="flex items-center border border-gray-500 bg-white rounded dark:border-gray-500 w-80 lg:w-96 p-3 my-4 text-xs placeholder:text-gray-500 focus:outline-gray-500">
                      <input
                        className="flex-1 focus:outline-none"
                        type="password"
                        placeholder="Mot de passe actuel"
                        {...register("initial")}
                      />
                    </div>
                    <p className=" text-xs text-red-500">{errors.initial?.message}</p>

                    <div className="flex items-center border border-gray-500 bg-white rounded dark:border-gray-500 w-80 lg:w-96 p-3 my-4 text-xs placeholder:text-gray-500 focus:outline-gray-500">

                      <input
                        className="flex-1 focus:outline-none"
                        type="password"
                        placeholder="Nouveau mot de passe"
                        {...register("password")}
                      />
                    </div>
                    <p className=" text-xs text-red-500">{errors.password?.message}</p>

                    <div className="flex items-center border border-gray-500 bg-white rounded dark:border-gray-500 w-80 lg:w-96 p-3 my-4 text-xs placeholder:text-gray-500 focus:outline-gray-500">
                      <input
                        className="flex-1 focus:outline-none"
                        type="password"
                        placeholder="Confirmer mot de passe"
                        {...register("passwordConfirmation")}
                      />
                    </div>
                    <p className=" text-xs text-red-500">{errors.passwordConfirmation?.message}</p>

                    {loading == false && <input className=" bg-black mt-4 p-3 text-xs font-semibold text-white lg:w-96 w-80 hover:bg-green-500 rounded-md cursor-pointer" value="Valider" type="submit" />}
                  </form>
                </div>
    </div>
  )
}

export default Setting