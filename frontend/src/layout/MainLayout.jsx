// layout/MainLayout.jsx — Responsive Layout for All Screens
import { Sidebar } from "./Sidebar.jsx";
import { TopNavbar } from "./TopNavbar.jsx";
import { useState } from "react";

export function MainLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-dark flex overflow-hidden">
      
      {/* Sidebar - Hidden on mobile, fixed on desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 z-50 lg:hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full lg:ml-[var(--sidebar-w)]">
        
        {/* Top Navbar */}
        <TopNavbar 
          title={title} 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        {/* Page Content - Responsive padding and scrolling */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden page-enter"
          style={{ 
            paddingTop: "var(--navbar-h)",
            maxWidth: "100vw"
          }}
        >
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
