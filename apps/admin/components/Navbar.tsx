"use client";

type NavbarProps = {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
};

export default function Navbar({
  onToggleSidebar,
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
    </header>
  );
}