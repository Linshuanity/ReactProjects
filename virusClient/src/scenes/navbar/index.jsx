import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import LiveSearch from 'components/LiveSearch';
import FlexBetween from 'components/FlexBetween';
import NotificationDrawer from './NotificationDrawer';

import { setMode, setLogout } from 'state';

import {
    Box,
    IconButton,
    InputBase,
    Typography,
    Select,
    MenuItem,
    FormControl,
    useTheme,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
} from '@mui/material';

import {
    DarkMode,
    LightMode,
    Notifications,
    Menu,
    Close,
} from '@mui/icons-material';



const Navbar = () => {
    const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false)
    const [results, setResults] = useState([])
    const [selectedProfile, setSelectedProfile] = useState(null)
    const [open, setOpen] = useState(false);
    const user = useSelector((state) => state.user)
    const userId = `${user.user_id}`

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const isNonMobileScreens = useMediaQuery('(min-width: 1000px)')

    const theme = useTheme()
    const neutralLight = theme.palette.neutral.light
    const dark = theme.palette.neutral.dark
    const background = theme.palette.background.default
    const primaryLight = theme.palette.primary.light
    const alt = theme.palette.background.alt

    const fullName = `${user.user_name}`

    const handleSearch = async (e) => {
        const { value } = e.target
        if (!value.trim()) return setResults([])

        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/subscribe/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                substring: value,
            }),
        })
        const update = await response.json()
        setSelectedProfile(update)
        return setResults(update)
    }
    

    return (
        <FlexBetween padding="1rem 6%" backgroundColor={alt}>
            <FlexBetween gap="1.75rem">
                <Typography
                    fontWeight="bold"
                    fontSize="clamp(1rem, 2rem, 2.25rem)"
                    color="primary"
                    onClick={() => navigate('/home')}
                    sx={{
                        '&:hover': {
                            color: dark,
                            cursor: 'pointer',
                        },
                    }}
                >
                    GoVirus
                </Typography>
                <FlexBetween
                    backgroundColor={neutralLight}
                    borderRadius="9px"
                    gap="3rem"
                    padding="0.1rem 1.5rem"
                >
                    <LiveSearch
                        results={results}
                        value={selectedProfile?.name}
                        renderItem={(item) => <p>{item.name}</p>}
                        onChange={handleSearch}
                        onSelect={(item) => setSelectedProfile(item)}
                    />
                </FlexBetween>
            </FlexBetween>

            {/* DESKTOP NAV */}
            {isNonMobileScreens ? (
                <FlexBetween gap="2rem">
                    <IconButton onClick={() => dispatch(setMode())}>
                        {theme.palette.mode === 'dark' ? (
                            <DarkMode sx={{ fontSize: '25px' }} />
                        ) : (
                            <LightMode sx={{ color: dark, fontSize: '25px' }} />
                        )}
                    </IconButton>
                    <NotificationDrawer/>
                    <FormControl variant="standard" value={fullName}>
                        <Select
                            value={fullName}
                            sx={{
                                backgroundColor: neutralLight,
                                width: '150px',
                                borderRadius: '0.25rem',
                                p: '0.25rem 1rem',
                                '& .MuiSvgIcon-root': {
                                    pr: '0.25rem',
                                    width: '3rem',
                                },
                                '& .MuiSelect-select:focus': {
                                    backgroundColor: neutralLight,
                                },
                            }}
                            input={<InputBase />}
                        >
                            <MenuItem value={fullName}>
                                <Typography>{fullName}</Typography>
                            </MenuItem>
                            <MenuItem onClick={() => dispatch(setLogout())}>
                                Log Out
                            </MenuItem>
                        </Select>
                    </FormControl>
                </FlexBetween>
            ) : (
                <IconButton
                    onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
                >
                    <Menu />
                </IconButton>
            )}

            {!isNonMobileScreens && isMobileMenuToggled && (
                <Box
                    position="fixed"
                    right="0"
                    top="0"
                    height="40%"
                    zIndex="10"
                    maxWidth="220px"  // Slightly increased for comfortable fit
                    minWidth="150px"
                    backgroundColor={background}
                    borderRadius="8px"  // Rounded corners for a softer look
                    boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)" // Subtle shadow for depth
                    p="1rem"  // Added padding for consistent inner spacing
                >
                    {/* CLOSE ICON */}
                    <Box display="flex" justifyContent="flex-end" mb="0.5rem">
                        <IconButton
                            onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
                            sx={{ color: dark }}
                        >
                            <Close />
                        </IconButton>
                    </Box>

                    {/* MENU ITEMS */}
                    <FlexBetween
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        gap="1rem"  // Reduced gap for a more compact look
                    >
                        {/* Theme Toggle Button */}
                        <IconButton
                            onClick={() => dispatch(setMode())}
                            sx={{
                                fontSize: '30px',
                                color: dark,
                                borderRadius: '50%',
                                padding: '0.5rem',
                                '&:hover': { backgroundColor: theme.palette.action.hover },
                            }}
                        >
                            {theme.palette.mode === 'dark' ? (
                                <DarkMode sx={{ fontSize: '24px' }} />
                            ) : (
                                <LightMode sx={{ color: dark, fontSize: '24px' }} />
                            )}
                        </IconButton>

                        {/* Notification Drawer */}
                        <NotificationDrawer />

                        {/* User Menu */}
                        <FormControl
                            variant="standard"
                            sx={{
                                width: '100%',
                                mt: '0.5rem',
                                backgroundColor: neutralLight,
                                borderRadius: '0.5rem',
                                padding: '0.25rem',
                            }}
                        >
                            <Select
                                value={fullName}
                                sx={{
                                    width: '100%',
                                    borderRadius: '0.25rem',
                                    padding: '0.25rem 1rem',
                                    backgroundColor: neutralLight,
                                    '& .MuiSvgIcon-root': {
                                        paddingRight: '0.5rem',
                                        fontSize: '1.5rem',
                                    },
                                    '& .MuiSelect-select:focus': {
                                        backgroundColor: neutralLight,
                                    },
                                }}
                                input={<InputBase />}
                            >
                                <MenuItem value={fullName}>
                                    <Typography>{fullName}</Typography>
                                </MenuItem>
                                <MenuItem onClick={() => dispatch(setLogout())}>
                                    Log Out
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </FlexBetween>
                </Box>
            )}
        </FlexBetween>
    )
}

export default Navbar
