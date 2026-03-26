import NavBar from "@/components/shared-component/NavBar";
import SideBar from "@/components/shared-component/SideBar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
        <SideBar />
        <div className="md:ml-64 min-h-screen flex flex-col">
            <NavBar />
            <div className="flex-1 p-3 sm:p-4 md:p-6 pt-16 md:pt-4">
                {children}
            </div>
        </div>
    </div>
  )
}
