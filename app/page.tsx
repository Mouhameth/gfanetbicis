'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from "zod";
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import { BsKey } from "react-icons/bs";
import logo from "@/assets/applogo.png";
import Image from 'next/image';
import { signIn, signOut, useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";


const schema = zod.object({
  email: zod.string(
    {
      required_error: "le nom d'utilisateur est obligatoire",
      invalid_type_error: "entrez un nom d'utilisateur valide"
    }
  ).min(2, { message: "Le nom d'utilisateur doit comporter au moins 2 caractères" }),
  password: zod.string({
    required_error: "le mot de passe est obligatoire"
  }).min(6, { message: "Le mot de passe doit comporter au moins 6 caractères" }),
}).required();
type FormData = zod.infer<typeof schema>;

export default function Home() {

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const [loading, setLodading] = useState(false);
  const router = useRouter();

  const onSubmit = useCallback(async (data: FormData) => {
    try {
      setLodading(true);

      const response = await signIn('credentials', {
        username: data.email,
        password: data.password,
        redirect: false
      });

      if (response?.error) {
        setLodading(false);
        toast.error("Le compte est désactivé ou les informations d'identification sont incorrectes", { duration: 3000, className: " text-xs text-center" });
      }
    }
    catch (error) {
      setLodading(false);
      toast.error("Le compte est désactivé ou les informations d'identification sont incorrectes", { duration: 3000, className: " text-xs text-center" });
    }
    finally {

    }
  }, [setLodading]);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role.name === "user") {
        router.push('/home/office')
      } 
      else {
        router.push('/home')
      }
    }

  }, [session, status, router])

  return (
    <div className=' overflow-hidden h-screen bg-white lg:bg-gray-100 lg:py-32'>

      <div className="lg:w-2/3 mx-auto pb-32 lg:pb-0">
        {loading && <Box sx={{ width: '100%', margin: 'auto' }}>
          <LinearProgress color="success" />
        </Box>}
      </div>
      <div className=" lg:h-96 lg:w-2/3 bg-white lg:mx-auto lg:flex lg:content-between">

        <div className=" mx-auto my-12 lg:my-0 lg:flex lg:h-96 w-1/2 bg-white lg:border-r border-gray">
          <Image className=" mx-auto my-auto" src={logo} alt={"logo"} width={100} />
        </div>

        <div className=" lg:h-96 lg:w-1/2 flex items-center">
          <form className=" mx-auto" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center border border-gray rounded dark:border-gray w-80 lg:w-96 p-3 my-2 text-xs placeholder:text-gray focus:outline-gray">
              <span className="pr-2">
                <MdOutlineAlternateEmail className="h-3 w-3 text-blue" />
              </span>
              <input
                className="flex-1 focus:outline-none"
                type="text"
                placeholder="Nom utilisateur"
                {...register("email")}
              />
            </div>
            <p className="text-xs text-red-500">{errors.email?.message}</p>

            <div className="flex items-center border border-gray rounded dark:border-gray w-80 lg:w-96 p-3 my-4 text-xs placeholder:text-gray focus:outline-gray">
              <span className=" pr-2">
                <BsKey className="h-3 w-3 text-blue" />
              </span>
              <input
                className="flex-1 focus:outline-none"
                type="password"
                placeholder="Mot de passe"
                {...register("password")}
              />
            </div>
            <p className=" text-xs text-red-500">{errors.password?.message}</p>

            {loading == false && <input className=" bg-black rounded mt-4 p-3 text-xs font-semibold text-white lg:w-96 w-80 hover:bg-green-500 cursor-pointer" value="Se connecter" type="submit" />}
          </form>
        </div>

      </div>
    </div>
  )
}