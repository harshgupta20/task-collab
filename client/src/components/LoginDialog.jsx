import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    Backdrop,
    TextField,
    Button,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import LoginSvg from "../assets/login-screen.svg";
import { MdViewKanban, MdHomeFilled, MdLiveHelp, MdLogout, MdPeopleAlt, MdOutlineTaskAlt } from "react-icons/md";
import { toast } from "sonner";
import { customQueryCollection, getData } from "../firebase/firestore";
import { encodeData } from "../utils/jwt";

export default function LoginDialog({ open }) {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLoginSubmit = async () => {
        try {
            const response = await customQueryCollection("users", [["email", "==", email], ["password", "==", password]]);
            return { status: 'success', data: response[0] };
        }
        catch (err) {
            toast.warning("Login failed. Please try again.");
            return { status: 'error', data: null };
        }
    }

    const handleSubmit = async () => {
        if (email && password) {
            const isUserValid = await handleLoginSubmit();
            if (isUserValid.status === 'success' && isUserValid.data) {
                const token = encodeData({
                    id: isUserValid.data.id,
                    email: isUserValid.data.email,
                    name: isUserValid.data.name,
                    created_by: isUserValid.data.created_by,
                    is_admin: isUserValid.data.is_admin,
                    position: isUserValid.data.position
                });
                localStorage.setItem("token", token);
                login({
                    id: isUserValid.data.id,
                    email: isUserValid.data.email,
                    name: isUserValid.data.name,
                    created_by: isUserValid.data.created_by,
                    is_admin: isUserValid.data.is_admin,
                    position: isUserValid.data.position
                });
                toast.success("Login successful!");
            } else {
                toast.error("Invalid email or password.");
            }
        }

    };

    return (
        <Dialog
            open={open}
            maxWidth="xl"
        >
            <DialogContent className="p-0 bg-gray-100 flex w-[1200px] h-[400px]">

                {/* LEFT PANEL */}
                <div className="w-1/2 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        {/* <PersonIcon sx={{ fontSize: 120 }} className="text-gray-500" /> */}
                        <img src={LoginSvg} alt="Login" className="w-100 h-100" />
                    </div>
                </div>

                {/* DIVIDER */}
                {/* <div className="w-px bg-gray-300" /> */}

                {/* RIGHT PANEL */}
                <div className="w-1/2 p-8 flex flex-col justify-center">
                    <h2 className="flex items-center gap-2 text-gray-700 text-2xl font-semibold mb-6">
                        Login
                        <span className="text-gray-400">
                            {"|"}
                        </span>
                        <div className='flex text-green-600 gap-2 items-center'>
                            <MdOutlineTaskAlt /> Task Collab
                        </div>
                    </h2>

                    <div className="flex flex-col gap-4">
                        <TextField
                            label="Email"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <TextField
                            label="Password"
                            variant="outlined"
                            type="password"
                            size="small"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            variant="contained"
                            onClick={handleSubmit}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-md cursor-pointer normal-case py-2"
                            fullWidth
                        >
                            Login
                        </button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
