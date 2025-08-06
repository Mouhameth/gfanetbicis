"use client";
import useChangeHeaderTitle from '@/app/hooks/useChangedHeader';
import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from "zod";
import { FaKey } from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";
import Loader from '@/components/common/Loader';
import useAxiosAuth from '@/hooks/useAxiosAuth';


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

const Setting = () => {
  const axiosAuth = useAxiosAuth();
  const userUrl = `/user`;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const res = await axiosAuth.post(userUrl, data);
      if (res.status == 200) {
        reset();
        toast.success('Votre mot de passe a été changé avec succés!', { duration: 3000, className: " text-xs" });
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



  if (loading) {
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