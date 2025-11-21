// User Table Row Component
import {
  Eye,
  UserCheck,
  UserX,
  Crown,
  Trash2
} from 'lucide-react';
import { StatusBadge, RoleBadge } from '../Badge';

export const UserTableRow = ({ 
  user, 
  onSelectUser, 
  onBlockUser, 
  onUnblockUser, 
  onPromoteUser, 
  onDemoteUser, 
  onDeleteUser 
}) => (
  <tr 
    className="hover:bg-gray-50 cursor-pointer"
    onClick={onSelectUser} // 👈 whole row clickable
  >
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {(user.firstName?.[0] || 'U').toUpperCase()}
          </div>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <StatusBadge status={user.status} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <RoleBadge role={user.role} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {new Date(user.createdAt).toLocaleDateString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {user.resourcesUploaded?.length || 0}
    </td>
    <td 
      className="px-6 py-4 whitespace-nowrap text-sm font-medium"
      onClick={(e) => e.stopPropagation()} // 👈 stop row click for actions
    >
      <div className="flex items-center space-x-2">
        {/* Removed Eye icon because full row is clickable */}
        
        {user.status === 'active' && (
          <button
            onClick={() => onBlockUser(user)}
            className="text-red-600 hover:text-red-900"
            title="Block User"
          >
            <UserX size={16} />
          </button>
        )}
        
        {user.status === 'blocked' && (
          <button
            onClick={() => onUnblockUser(user._id)}
            className="text-green-600 hover:text-green-900"
            title="Unblock User"
          >
            <UserCheck size={16} />
          </button>
        )}
        
        {user.role !== 'admin' ? (
          <button
            onClick={() => onPromoteUser(user._id)}
            className="text-purple-600 hover:text-purple-900"
            title="Promote to Admin"
          >
            <Crown size={16} />
          </button>
        ) : (
          <button
            onClick={() => onDemoteUser(user._id)}
            className="text-orange-600 hover:text-orange-900"
            title="Demote from Admin"
          >
            <Crown size={16} className="opacity-50" />
          </button>
        )}
        
        <button
          onClick={() => onDeleteUser(user)}
          className="text-gray-400 hover:text-red-600"
          title="Delete User"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  </tr>
);
