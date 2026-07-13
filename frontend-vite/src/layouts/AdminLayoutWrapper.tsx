import { Outlet } from 'react-router-dom'
import AdminLayout from '@/app/admin/layout'

export function AdminLayoutWrapper() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
