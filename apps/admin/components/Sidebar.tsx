type Menu =
  | "Dashboard"
  | "Pesan"
  | "Preview"
  | "Pengaturan";

type SidebarProps = {
  menus: readonly Menu[];
  activeMenu: Menu;
  onSelect: (menu: Menu) => void;
  isOpen: boolean;
};

export default function Sidebar({
  menus,
  activeMenu,
  onSelect,
  isOpen,
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
    </aside>
  );
}