import React, { useState,useEffect } from "react";
import Sidebar from "../components/Sidebar";

const AdminLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};
const isMobile = useIsMobile();


  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={window.innerWidth <= 768}
      />

      <main
        className={`transition-all duration-300 ease-in-out w-full p-4 bg-gray-100 
          ${isOpen && !isCollapsed ? "ml-64" : isOpen && isCollapsed ? "ml-20" : "ml-0"}`}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
