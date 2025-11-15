import React, { useState, useEffect } from "react";
import { Modal, Box } from "@mui/material";
import { POSITIONS } from "../utils/constants";
import { addData } from "../firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

export default function UserModal({ open, onClose, user, onSubmit }) {
  const [form, setForm] = useState({ name: null, email: null, password: null, position: POSITIONS[0], is_admin: false });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        position: user.position,
        password: user.password,
        is_admin: user.is_admin,
      });
    } else {
      setForm({ name: null, email: null, password: null, position: POSITIONS[0], is_admin: false });
    }
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {

      const data = {
        id: user?.id,
        name: form.name,
        email: form.email,
        password: form.password,
        position: form.position,
        is_admin: form.is_admin,
        uuid: uuidv4(),
        created_by: "00"
      }
      const response = await onSubmit({data});
      if(response?.status){
        toast.success(response?.message);
        setForm({ name: null, email: null, password: null, position: POSITIONS[0], is_admin: false });
        onClose();
      }
      else{
        toast.warning(response?.message);
      }
    }
    catch (error) {
      toast.warning(error?.message || 'Failed to create user');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-white w-96 p-6 rounded-md border shadow-sm
        "
      >
        <h3 className="text-lg font-semibold mb-4">
          {user?.id ? "Edit User" : "Add User"}
        </h3>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="text"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />

          <select
            name="position"
            value={form.position || POSITIONS[0]}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            {POSITIONS.map((position, index) => (
              <option key={index} value={position}>
                {position}
              </option>
            ))}
          </select>

          <label htmlFor="is_admin">
            <input
              type="checkbox"
              name="is_admin"
              checked={form.is_admin}
              onChange={(e) => setForm({ ...form, is_admin: e.target.checked })}
            />
            Admin
          </label>

          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white rounded py-2 hover:bg-green-700"
          >
            {user ? "Update" : "Add"}
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-200 rounded py-2 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </Box>
    </Modal>
  );
}
