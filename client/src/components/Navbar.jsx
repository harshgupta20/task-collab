import React from 'react'
import { Link } from 'react-router';
import { MdViewKanban } from "react-icons/md";
import { MdHomeFilled } from "react-icons/md";
import { MdLiveHelp } from "react-icons/md";
import { MdLogout } from "react-icons/md";
import { MdPeopleAlt } from "react-icons/md";
import { RiChatAiFill } from "react-icons/ri";
import { BsStars } from "react-icons/bs";

const Navbar = () => {

    const ROUTES = [
        {
            name: 'Home',
            path: '/',
            icon: <MdHomeFilled />
        },
        {
            name: 'Kanban',
            path: '/kanban',
            icon: <MdViewKanban />
        },
        {
            name: 'Users',
            path: '/users',
            icon: <MdPeopleAlt />
        },
        {
            name: "Ask AI",
            path: "/ask-ai",
            icon: <BsStars />
        }
    ]

    return (
        <div className='p-4 flex flex-col justify-between items-center h-full border-r border-gray-200'>

            <div className='flex flex-col gap-10 w-full'>
                <h1 className='font-bold text-2xl text-green-600'>Tasks</h1>
                <div className='flex flex-col gap-3 w-full'>
                    {ROUTES.map((route, index) => (
                        <Link to={route.path}>
                            <button className='w-full flex gap-2 items-center text-left p-2 bg-gray-100 text-green-600 hover:bg-green-300 rounded-md cursor-pointer' key={index}>
                                <span>{route.icon}</span>{route.name}
                            </button>
                        </Link>
                    ))}
                </div>
            </div>

            <div className='flex flex-col gap-3 w-full'>
                <Link to={'/help-center'}>
                    <button className='w-full flex gap-2 items-center text-left p-2 text-green-600 bg-gray-100 hover:bg-green-300 rounded-md cursor-pointer'>
                        <MdLiveHelp />
                        Help Center
                    </button>
                </Link>

                <Link><button className='w-full flex gap-2 items-center text-left p-2 text-red-600 bg-gray-100 hover:bg-red-300 rounded-md cursor-pointer'>
                    <MdLogout />Logout
                </button></Link>
            </div>
        </div>
    )
}

export default Navbar