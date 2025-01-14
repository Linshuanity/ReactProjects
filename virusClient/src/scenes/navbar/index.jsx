import { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import LiveSearch from 'components/LiveSearch';
import FlexBetween from 'components/FlexBetween';
import NotificationDrawer from './NotificationDrawer';
import FloatLogin from 'components/FloatLogin'; // 引入 FloatLogin
import { LanguageContext } from 'components/LanguageContext';

import { setMode, setLogout } from 'state';

import {
    Box,
    IconButton,
    InputBase,
    Typography,
    Select,
    MenuItem,
    Button,
    FormControl,
    useTheme,
    useMediaQuery,
} from '@mui/material';

import {
    DarkMode,
    LightMode,
    Menu,
    Close,
} from '@mui/icons-material';

const Navbar = () => {
    const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
    const [results, setResults] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);

    const {currentLanguage, setLanguage} = useContext(LanguageContext);
    const user = useSelector((state) => state.user);
    const isAuth = Boolean(useSelector((state) => state.token));

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isNonMobileScreens = useMediaQuery('(min-width: 1000px)');

    const theme = useTheme();
    const neutralLight = theme.palette.neutral.light;
    const dark = theme.palette.neutral.dark;
    const background = theme.palette.background.default;
    const alt = theme.palette.background.alt;

    const fullName = user?.user_name || '';
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // 控制浮動登入視窗

    const handleSearch = async (e) => {
        const { value } = e.target;
        if (!value.trim()) return setResults([]);

        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/subscribe/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ substring: value, }),
        });
        const update = await response.json();
        setSelectedProfile(update);
        return setResults(update);
    };

    const handleOpenLoginModal = () => {
        setIsLoginModalOpen(true);
    };

    const handleCloseLoginModal = () => {
        setIsLoginModalOpen(false);
    };

    return (
        <FlexBetween padding="1rem 6%" backgroundColor={alt}>
            <FloatLogin isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} /> {/* 渲染浮動視窗 */}
            <FlexBetween gap="1.75rem">
                <Typography
                    fontWeight="bold"
                    fontSize="clamp(1rem, 2rem, 2.25rem)"
                    color="primary"
                    onClick={() => navigate('/')}
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

            {isNonMobileScreens ? (
                <FlexBetween gap="2rem">
                    <div>
                        <Select
                            value={currentLanguage} // Replace with your state for selected language
                            onChange={(event) => setLanguage(event.target.value)} // Replace with your state handler
                            displayEmpty
                            inputProps={{ 'aria-label': 'Select language' }}
                        >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="zh">中文</MenuItem>
                            {/* Add more languages as needed */}
                        </Select>
                    </div>
                    <IconButton onClick={() => dispatch(setMode())}>
                        {theme.palette.mode === 'dark' ? (
                            <DarkMode sx={{ fontSize: '25px' }} />
                        ) : (
                            <LightMode sx={{ color: dark, fontSize: '25px' }} />
                        )}
                    </IconButton>
                    {isAuth && (<NotificationDrawer />)}
                    {!isAuth ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenLoginModal} // 打開浮動視窗
                        >
                            Sign In
                        </Button>
                    ) : (
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
                        </FormControl>)
                    }
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
                    maxWidth="220px"
                    minWidth="150px"
                    backgroundColor={background}
                    borderRadius="8px"
                    boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
                    p="1rem"
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
                        gap="1rem"
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
                        {isAuth && (<NotificationDrawer />)}

                        {/* Login Button for Mobile */}
                        {!isAuth && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenLoginModal} // 打開浮動視窗
                                sx={{ width: '100%' }}
                            >
                                Log In
                            </Button>
                        )}

                        {/* User Menu */}
                        {isAuth && (
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
                        )}
                    </FlexBetween>
                </Box>
            )}
        </FlexBetween>
    );
};

export default Navbar;
