import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { MdViewKanban, MdHomeFilled, MdLiveHelp, MdLogout, MdPeopleAlt, MdOutlineTaskAlt } from "react-icons/md";
import { BsStars } from "react-icons/bs";

const Navbar = () => {
    const location = useLocation();

    const ROUTES = [
        { name: 'Home', path: '/', icon: <MdHomeFilled /> },
        { name: 'Projects', path: '/projects', icon: <MdViewKanban /> },
        { name: 'Users', path: '/users', icon: <MdPeopleAlt /> },
        { name: 'Ask AI', path: '/ask-ai', icon: <BsStars /> },
        { name: 'Help Center', path: '/help-center', icon: <MdLiveHelp /> },
    ];

    // Update document title on route change
    useEffect(() => {
        const activeRoute = ROUTES.find(route => 
            route.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(route.path)
        );
        document.title = activeRoute ? `${activeRoute.name} | Task Collab` : 'Task Collab';
    }, [location]);

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className='p-4 flex flex-col justify-between items-center h-full border-r border-gray-200'>
            <div className='flex flex-col gap-10 w-full'>
                <h1 className='font-bold text-2xl text-green-600 flex gap-2 items-center'>
                    <MdOutlineTaskAlt /> Task Collab
                </h1>

                <div className='flex flex-col gap-3 w-full'>
                    {ROUTES.filter(route => route.path !== '/help-center').map((route, index) => (
                        <Link to={route.path} key={index}>
                            <button
                                className={`w-full flex gap-2 items-center text-left p-2 rounded-md cursor-pointer
                  ${isActive(route.path) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-green-600 hover:bg-green-100'}`}
                            >
                                <span>{route.icon}</span> {route.name}
                            </button>
                        </Link>
                    ))}
                </div>
            </div>

            <div className='flex flex-col gap-3 w-full'>
                <Link to='/help-center'>
                    <button
                        className={`w-full flex gap-2 items-center text-left p-2 rounded-md cursor-pointer
                  ${isActive('/help-center') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-green-600 hover:bg-green-100'}`}
                    >
                        <MdLiveHelp /> Help Center
                    </button>
                </Link>

                <Link to='/logout'>
                    <button className='w-full flex gap-2 items-center text-left p-2 text-red-600 bg-gray-100 hover:bg-red-100 rounded-md cursor-pointer'>
                        <MdLogout /> Logout
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default Navbar;
