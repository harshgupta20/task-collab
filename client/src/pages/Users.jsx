import { useEffect, useState } from "react";
import UserModal from "../components/UserModal";
import { addData, customQueryCollection, deleteData, updateData } from "../firebase/firestore";
import RichTooltip from "../components/ToolTip";
import PersonCard from "../components/PersonCard";
import { toast } from "sonner";
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";


export default function Users() {
  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [usersList, setUsersList] = useState([]);

  const handleAdd = () => {
    setEditUser(null);
    setOpenModal(true);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setOpenModal(true);
  };

  const fetchUsers = async () => {
    try {
      const response = await customQueryCollection("users", [["created_by", "==", "00"]]);
      setUsersList(response);
    }
    catch (error) {
      console.log("harsh error", error);
    }
  }

  const updateUser = async ({ data }) => {
    try {
      const id = data?.id;
      delete data?.id;
      const response = await updateData("users", id, data);
      fetchUsers();
      return { status: true, message: 'User updated successfully' };
    }
    catch (error) {
      return { status: false, message: error?.message || 'Failed to update user' };
    }
  }

  const addUser = async ({ data }) => {
    try {
      delete data?.id;
      const response = await addData("users", data);
      if (response) {
        fetchUsers();
        return { status: true, message: 'User created successfully' };
      }
    }
    catch (error) {
      // toast.warning('Event has been created');
      return { status: false, message: error?.message || 'Failed to create user' };
    }
  }

  const deleteUser = async ({ id }) => {
    try {
      const response = await deleteData("users", id);
      fetchUsers();
      toast.success('User deleted successfully');
    }
    catch (error) {
      toast.warning(error?.message || 'Failed to delete user');
    }
  }



  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="w-2/3 flex items-center gap-4">
          <h2 className="text-xl font-semibold">Users</h2>
          <input onChange={(e) => setSearchText(e.target.value)} className="min-w-0 grow px-4 py-1 border border-gray-300 rounded-3xl outline-none" type="search" placeholder="Search by name/email" />
        </div>

        <button
          onClick={handleAdd}
          className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
        >
          + Add User
        </button>
      </div>

      <div className="bg-white border rounded-md w-full shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-sm font-medium">Position</th>
              <th className="px-4 py-3 text-sm font-medium text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {usersList.filter((user) =>
              user.name.toLowerCase().includes(searchText.toLowerCase()) || user.email.toLowerCase().includes(searchText.toLowerCase())
            ).map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <RichTooltip className="p-0 m-0" title={
                    <PersonCard
                      id={user.id}
                      name={user.name}
                      email={user.email}
                      position={user.position}
                      uuid={user.uuid}
                      isAdmin={user.is_admin}
                    />
                  }>
                    {user.name}
                  </RichTooltip>
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.position}</td>

                <td className="px-4 py-3">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-gray-600 hover:text-black cursor-pointer"
                    >
                      <MdEdit />
                    </button>

                    <button onClick={() => deleteUser({ id: user?.id })} className="text-red-600 hover:text-red-800 cursor-pointer">
                      <MdDelete />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        user={editUser}
        onSubmit={editUser?.id ? updateUser : addUser}
      />
    </div>
  );
}
