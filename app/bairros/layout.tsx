import Sidebar from '@/components/layout/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      <Sidebar />
      <div className="ml-[252px] flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}
