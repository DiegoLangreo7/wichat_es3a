import React, { useState, useRef } from "react";
import { AppBar, Typography, Box, Toolbar, Menu, MenuItem, Button, ClickAwayListener } from "@mui/material";
import { useNavigate } from "react-router";

const NavBar: React.FC = () => {
    const [openUserMenu, setOpenUserMenu] = useState(false);
    const [openPlayMenu, setOpenPlayMenu] = useState(false);
    const playButtonRef = useRef<HTMLButtonElement | null>(null);
    const userButtonRef = useRef<HTMLButtonElement | null>(null);
    const navigate = useNavigate();
    const user : string = localStorage.getItem("username") || "Usuario";
    const username : string = user === "Usuario" ? "Usuario" : user.slice(1, user.length-1);

    const handleUserMenu = () => setOpenUserMenu((prev) => !prev);
    const handleUserMenuClose = () => setOpenUserMenu(false);
    const handlePlayMenu = () => setOpenPlayMenu((prev) => !prev);
    const handlePlayMenuClose = () => setOpenPlayMenu(false);

    const handleQuestions = () => {
        navigate("/main/question");
    };

    const handleCards = () => {
        navigate("/cards");
    };

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
        handleUserMenuClose();
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
                    <ClickAwayListener onClickAway={handlePlayMenuClose}>
                        <Box id="play-menu-container" sx={{ display: "flex", alignItems: "center" }}>
                            <Button id="play-menu-button"
                                    ref={playButtonRef}
                                    onClick={handlePlayMenu}
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
                                Jugar
                            </Button>
                            <Menu id="play-menu"
                                  open={openPlayMenu}
                                  anchorEl={playButtonRef.current}
                                  onClose={handlePlayMenuClose}
                                  anchorOrigin={{
                                      vertical: 'bottom',
                                      horizontal: 'left',
                                  }}
                                  transformOrigin={{
                                      vertical: 'top',
                                      horizontal: 'left',
                                  }}
                                  PaperProps={{
                                      sx: {
                                          mt: 1,
                                          backgroundColor: "#5f4bb6",
                                          boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
                                          borderRadius: 2,
                                          minWidth: 160,
                                      },
                                  }}
                            >
                                <MenuItem id="play-menu-questions" onClick={handleQuestions} sx={{ color: "#F7FFF7", "&:hover": {color: "#202A25", backgroundColor: "#EDC9FF" } }}>
                                    Preguntas
                                </MenuItem>
                                <MenuItem id="play-menu-cards" onClick={handleCards} sx={{ color: "#F7FFF7", "&:hover": {color: "#202A25", backgroundColor: "#EDC9FF" } }}>
                                    Memory
                                </MenuItem>
                            </Menu>
                        </Box>
                    </ClickAwayListener>
                </Box>

                <ClickAwayListener onClickAway={handleUserMenuClose}>
                    <Box id="user-menu-container" sx={{ display: "flex", alignItems: "center" }}>
                        <Button id="user-menu-button"
                                ref={userButtonRef}
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
                              anchorEl={userButtonRef.current}
                              onClose={handleUserMenuClose}
                              anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'right',
                              }}
                              transformOrigin={{
                                  vertical: 'top',
                                  horizontal: 'right',
                              }}
                              PaperProps={{
                                  sx: {
                                      mt: 1,
                                      backgroundColor: "#5f4bb6",
                                      boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
                                      borderRadius: 2,
                                      minWidth: 160,
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