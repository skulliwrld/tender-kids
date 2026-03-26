// Optimized SideBar - re-exports from SideBarClient
// This maintains backward compatibility while using the optimized client component
import SideBarClient from './SideBarClient'

export default function SideBar({ isOpen, onClose }) {
    return <SideBarClient isOpen={isOpen} onClose={onClose} />
}
