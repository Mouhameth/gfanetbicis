"use client";

import Header from "@/components/Header/index";
import SideBar from "@/components/Sidebar/index";

export default function RootLayout({
    children
  }: {
    children: React.ReactNode
  }) {
    return (
          <div className="h-screen flex w-screen overflow-hidden">
            <SideBar/>
            <main className=" bg-white relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">  
            <Header/>
            {children}</main>
          </div>
    )
  }