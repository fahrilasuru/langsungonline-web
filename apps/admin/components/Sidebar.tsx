type Menu =
  | "Target"
  | "Pesan"
  | "Preview";

type SidebarProps = {
  menus: readonly Menu[];
  activeMenu: Menu;
  onSelect: (menu: Menu) => void;
  isOpen: boolean;
    onLogout: () => void;
};

export default function Sidebar({
  menus,
  activeMenu,
  onSelect,
  isOpen,
    onLogout,
}: SidebarProps) {
  return (
    <aside
      id="sidebar"
      className={isOpen ? "sidebar open" : "sidebar"}
    >
      <nav aria-label="Menu utama">
        {menus.map((menu) => (
          <button
            key={menu}
            type="button"
            className={
              menu === activeMenu
                ? "sidebar-item active"
                : "sidebar-item"
            }
            aria-current={menu === activeMenu ? "page" : undefined}
            onClick={() => onSelect(menu)}
          >
            {menu}
          </button>
        ))}
      </nav>

        <button
        type="button"
        className="logout-button"
        onClick={onLogout}
      >
        Keluar
      </button>
    </aside>
  );
}