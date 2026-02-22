// layout/MainLayout.jsx
import { Sidebar }   from "./Sidebar.jsx";
import { TopNavbar } from "./TopNavbar.jsx";

export function MainLayout({ children, title }) {
  return (
    <div className="min-h-screen bg-stone-dark flex">
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: "var(--sidebar-w)" }}>
        <TopNavbar title={title} />
        <main
          className="flex-1 overflow-y-auto page-enter"
          style={{ paddingTop: "var(--navbar-h)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
