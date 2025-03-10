import React, { useState, useRef } from "react";
import { AppBar, Typography, Box, Toolbar, Menu, MenuItem, Button, ClickAwayListener } from "@mui/material";

const NavBar: React.FC = () => {
    const [openUserMenu, setOpenUserMenu] = useState(false); // Estado para controlar la visibilidad del menú
    const buttonRef = useRef<HTMLButtonElement | null>(null);  // Referencia al botón

    const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setOpenUserMenu((prev) => !prev);  // Cambiar estado para abrir o cerrar el menú
    };

    const handleMenuClose = () => {
        setOpenUserMenu(false);  // Cerrar el menú
    };

    return (
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end'}}>
            <AppBar position="static">
                <Toolbar sx= {{backgroundColor: "#2F353B"}}>
                    {/* Botón "Usuario" que abrirá el menú */}
                    <ClickAwayListener onClickAway={handleMenuClose}>
                    <Button
                        ref={buttonRef}  // Vinculamos la referencia
                        size="large"
                        color="inherit"
                        aria-haspopup="true"
                        onClick={handleUserMenu}  // Abre el menú
                        data-testid="open-language-menu"
                    >
                        Usuario
                    </Button>
                        </ClickAwayListener>
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Typography variant="h6" component="div" style={{ color: "white" }}>
                            WI CHAT
                        </Typography>
                    </Box>

                    {/* Usamos ClickAwayListener para cerrar el menú al hacer clic fuera */}

                        <Menu
                            id="language-appbar"
                            open={openUserMenu}  // Controlamos la apertura con el estado
                            anchorEl={buttonRef.current}  // Usamos el botón como ancla
                            onClose={handleMenuClose}  // Cerrar el menú al hacer clic fuera
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                            PaperProps={{
                                sx: {
                                    marginTop : .5,
                                    backgroundColor: "#2F353B",  // Color de fondo del menú
                                    boxShadow: 3,  // Sombra para mejor visibilidad
                                    borderRadius: 2,  // Bordes redondeados
                                },
                            }}
                        >
                            {/* Opciones dentro del menú */}
                            <MenuItem onClick={handleMenuClose}  sx= {{color: "#FFFFFF",}}>
                                Historial
                            </MenuItem>
                            <MenuItem onClick={handleMenuClose} sx= {{color: "#FFFFFF",}}>
                                Cuenta
                            </MenuItem>
                        </Menu>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default NavBar;
