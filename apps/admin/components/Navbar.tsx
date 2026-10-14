"use client";

type NavbarProps = {
  onToggleSidebar: () => void;
  onLogout: () => void;
  sidebarOpen: boolean;
};

export default function Navbar({
  onToggleSidebar,
  onLogout,
  sidebarOpen,
}: NavbarProps) {
  return (
    <header className="navbar">
      <button
        type="button"
        className="menu-button"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"}
        aria-controls="sidebar"
        aria-expanded={sidebarOpen}
      >
        <span aria-hidden="true">☰</span>
      </button>

      <strong>Admin Panel</strong>

      <button
        type="button"
        className="logout-button"
        onClick={onLogout}
      >
        Keluar
      </button>
    </header>
  );
}