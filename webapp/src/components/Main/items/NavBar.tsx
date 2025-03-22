import React, { useState, useRef } from "react";
import { AppBar, Typography, Box, Toolbar, Menu, MenuItem, Button, ClickAwayListener } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NavBar: React.FC = () => {
    const [openUserMenu, setOpenUserMenu] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const navigate = useNavigate(); 

    const handleUserMenu = () => setOpenUserMenu((prev) => !prev);
    const handleMenuClose = () => setOpenUserMenu(false);

    const handleLogout = () => {
        handleMenuClose(); 
        localStorage.removeItem("token");
        navigate("/logout"); 
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: "#1E293B", boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)" }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingX: 2 }}>
                
                <Typography 
                    variant="h6" 
                    sx={{ 
                        color: "white", 
                        fontWeight: "bold", 
                        letterSpacing: "1px",
                        cursor: "pointer",
                        transition: "color 0.3s ease-in-out",
                        "&:hover": { color: "#3B82F6" } 
                    }}
                >
                    WI CHAT
                </Typography>

                <ClickAwayListener onClickAway={handleMenuClose}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Button
                            ref={buttonRef}
                            onClick={handleUserMenu}
                            sx={{
                                color: "white",
                                fontSize: "1rem",
                                textTransform: "none",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                transition: "all 0.3s ease-in-out",
                                "&:hover": { 
                                    backgroundColor: "rgba(255, 255, 255, 0.2)", 
                                    transform: "scale(1.05)"
                                },
                            }}
                        >
                            Usuario
                        </Button>
                        <Menu
                            open={openUserMenu}
                            anchorEl={buttonRef.current}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    backgroundColor: "#1E293B",
                                    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
                                    borderRadius: 2,
                                    minWidth: 160,
                                    transition: "opacity 0.2s ease-in-out",
                                },
                            }}
                        >
                            <MenuItem onClick={handleMenuClose} sx={{ color: "#FFFFFF", "&:hover": { backgroundColor: "#40474D" } }}>
                                Historial
                            </MenuItem>
                            <MenuItem onClick={handleMenuClose} sx={{ color: "#FFFFFF", "&:hover": { backgroundColor: "#40474D" } }}>
                                Cuenta
                            </MenuItem>
                            <MenuItem 
                                onClick={handleLogout} 
                                sx={{ 
                                    color: "#FF4D4D", 
                                    fontWeight: "bold", 
                                    "&:hover": { backgroundColor: "#5A1F1F" } 
                                }}
                            >
                                Cerrar sesión
                            </MenuItem>
                        </Menu>
                    </Box>
                </ClickAwayListener>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;