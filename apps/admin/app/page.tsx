"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import LoginDialog from "@/components/LoginDialog";
import ToDoList from "@/components/ToDoList";
import Messages from "@/components/Messages";
import SEO from "@/components/SEO";
import { menus } from "@/types/menu";
import type { Menu } from "@/types/menu";

export default function Page() {
  const [activeMenu, setActiveMenu] = useState<Menu>(menus[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setLoggedIn(sessionStorage.getItem("loggedIn") === "true");
  }, []);

  function handleLogin(): void {
    sessionStorage.setItem("loggedIn", "true");
    setLoggedIn(true);
  }

  function handleLogout(): void {
    sessionStorage.removeItem("loggedIn");
    setLoggedIn(false);
    setSidebarOpen(false);
  }

  function handleSelect(menu: Menu): void {
    setActiveMenu(menu);
    setSidebarOpen(false);
  }

  function handleToggleSidebar(): void {
    setSidebarOpen((prev) => !prev);
  }

  function handleCloseSidebar(): void {
    setSidebarOpen(false);
  }

  if (loggedIn === null) {
    return null;
  }

  if (!loggedIn) {
    return <LoginDialog onSuccess={handleLogin} />;
  }

  return (
    <>
      <Navbar
        onToggleSidebar={handleToggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      <Sidebar
        menus={menus}
        activeMenu={activeMenu}
        onSelect={handleSelect}
        isOpen={sidebarOpen}
          onLogout={handleLogout}
      />

      {sidebarOpen && (
        <div
          className="overlay"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      <main className="content">
          {activeMenu == "Target" && <ToDoList />}
          {activeMenu == "Pesan" && <Messages />}
          {activeMenu == "Preview" && <Previews />}
          {activeMenu == "SEO" && <SEO />}
      </main>
    </>
  );
}