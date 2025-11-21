// Badge Components

export const StatusBadge = ({ status }) => {
  const statusClasses = {
    active: 'bg-green-100 text-green-800',
    blocked: 'bg-red-100 text-red-800',
    suspended: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const roleClasses = {
    admin: 'bg-purple-100 text-purple-800',
    user: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleClasses[role] || 'bg-gray-100 text-gray-800'}`}>
      {role?.charAt(0).toUpperCase() + role?.slice(1) || 'User'}
    </span>
  );
};

export const ResourceStatusBadge = ({ status }) => {
  const statusClasses = {
    pending: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
    </span>
  );
};