import { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Box,
    Tooltip,
} from '@mui/material';
import { Logout, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleClose();
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userAvatar = user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U';

    return (
        <AppBar
            position="static"
            elevation={1}
            sx={{
                backgroundColor: 'background.paper',
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', py: 0.5 }}>
                {/* Left: App Name */}
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        fontWeight: 600,
                        letterSpacing: '-0.5px',
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate('/')}
                >
                    ChatApp
                </Typography>

                {/* Right: User Menu */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Account">
                        <IconButton onClick={handleMenu} size="small" sx={{ p: 0 }}>
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: 'primary.main',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                }}
                            >
                                {userAvatar}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    {/* Dropdown Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        PaperProps={{
                            elevation: 3,
                            sx: {
                                mt: 1.5,
                                minWidth: 180,
                                '& .MuiMenuItem-root': {
                                    py: 1.2,
                                    fontSize: '0.9rem',
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem disabled>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person fontSize="small" />
                                <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                        {userName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {user?.email}
                                    </Typography>
                                </Box>
                            </Box>
                        </MenuItem>

                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <Logout fontSize="small" sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}