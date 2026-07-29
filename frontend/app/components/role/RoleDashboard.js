import React from 'react';
import AdminReports from './AdminReports';
import ManagerView from './ManagerView';
import StaffView from './StaffView';

export default function RoleDashboard({ user }) {
  const role = user?.role || 'staff';

  const map = {
    admin: <AdminReports />,
    manager: <ManagerView />,
    staff: <StaffView />
  };

  return map[role] || <StaffView />;
}
