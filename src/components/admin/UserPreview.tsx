
import React from 'react';

interface User {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'bidder';
}

interface UserPreviewProps {
  users: User[];
}

const UserPreview: React.FC<UserPreviewProps> = ({ users }) => {
  if (users.length === 0) return null;

  return (
    <div className="border rounded-md p-4">
      <h4 className="font-medium mb-2">Users to Create ({users.length})</h4>
      <div className="max-h-40 overflow-y-auto">
        {users.slice(0, 10).map((user, index) => (
          <div key={index} className="text-sm py-1 border-b last:border-b-0">
            {user.name} ({user.email}) - {user.role}
          </div>
        ))}
        {users.length > 10 && (
          <div className="text-sm py-1 text-muted-foreground">
            ... and {users.length - 10} more users
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPreview;
