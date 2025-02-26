import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import {Button} from '@mui/material';

const NavBar = () => {
    return (
        <nav className="bg-blue-600 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="contained" color="primary">
                            Usuario
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white text-gray-700 w-48">
                        <DropdownMenuItem>
                            <Link to="/historial" className="w-full">Historial</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link to="/cuenta" className="w-full">Cuenta</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
};

export default NavBar;
