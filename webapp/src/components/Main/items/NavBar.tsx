import React, { useState, useRef } from "react";
import { AppBar, Typography, Box, Toolbar, Menu, MenuItem, Button, ClickAwayListener } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NavBar: React.FC = () => {
    const [openUserMenu, setOpenUserMenu] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const navigate = useNavigate();
    const user : string = localStorage.getItem("username") || "Usuario";
    const username : string = user === "Usuario" ? "Usuario" : user.slice(1, user.length-1);

    const handleUserMenu = () => setOpenUserMenu((prev) => !prev);
    const handleMenuClose = () => setOpenUserMenu(false);

    const handleHistoric = () => {
        navigate("/historic");
    };

    const handleRanking = () => {
        navigate("/ranking");
    };

    const handleMain = () => {
        navigate("/main");
    };

    const handleLogout = () => {
        handleMenuClose(); 
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/logout"); 
    };

    const handleApi = () => {
        navigate("/api");
    };

    return (
        <AppBar id="app-bar-component" position="static" sx={{ backgroundColor: "#5f4bb6", boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)" }}>
            <Toolbar id="tool-bar-component" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingX: 2 }}>
                <Box id="elements-container" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography id="home-link"
                        variant="h6"
                        onClick={handleMain}
                        sx={{ 
                            color: "white", 
                            fontWeight: "bold", 
                            letterSpacing: "1px",
                            cursor: "pointer",
                            transition: "color 0.3s ease-in-out",
                            "&:hover": { color: "#202A25" }
                        }}
                    >
                        WI CHAT
                    </Typography>
    
                    <Button id="ranking-button"
                        onClick={handleRanking}
                        sx={{
                            color: "white",
                            fontSize: "1rem",
                            textTransform: "none",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            transition: "all 0.3s ease-in-out",
                            "&:hover": { 
                                backgroundColor: "#5f4bb6",
                                transform: "scale(1.05)"
                            },
                        }}
                    >
                        Ranking Global
                    </Button>

                    <Button id="api-button"
                        onClick={handleApi}
                        sx={{
                            color: "white",
                            fontSize: "1rem",
                            textTransform: "none",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            transition: "all 0.3s ease-in-out",
                            "&:hover": { 
                                backgroundColor: "rgba(255, 255, 255, 0.2)", 
                                transform: "scale(1.05)"
                            },
                        }}
                    >
                        API Platform
                    </Button>
                </Box>
    
                <ClickAwayListener onClickAway={handleMenuClose}>
                    <Box id="user-menu-container" sx={{ display: "flex", alignItems: "center" }}>
                        <Button id="user-menu-button"
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
                                    backgroundColor: "#5f4bb6",
                                    transform: "scale(1.05)"
                                },
                            }}
                        >
                            {username}
                        </Button>
                        <Menu id="user-menu"
                            open={openUserMenu}
                            anchorEl={buttonRef.current}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    backgroundColor: "#5f4bb6",
                                    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
                                    borderRadius: 2,
                                    minWidth: 160,
                                    transition: "opacity 0.2s ease-in-out",
                                },
                            }}
                        >
                            <MenuItem id="user-menu-historic" onClick={handleHistoric} sx={{ color: "#F7FFF7", "&:hover": {color: "#202A25", backgroundColor: "#EDC9FF" } }}>
                                Historial
                            </MenuItem>
                            <MenuItem id="user-menu-logout"
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
}    

export default NavBar;