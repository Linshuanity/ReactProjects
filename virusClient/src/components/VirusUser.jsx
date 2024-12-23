import { PersonAddOutlined, PersonRemoveOutlined } from '@mui/icons-material'
import { Box, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateFriends } from 'state'
import { useState } from 'react'
import FlexBetween from './FlexBetween'
import UserImage from './UserImage'

const VirusUser = ({
    friend_id,
    name,
    user_picture_path,
    subscriber,
    is_friend,
    is_main = false,
    action_icon = true,
}) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    // const { _id } = useSelector((state) => state?.user)
    const loggedInUserId = useSelector((state) => state.user?._id); 
    const token = useSelector((state) => state.token)
    const isAuth = Boolean(token); // 是否登入

    const friendId = friend_id
    const { palette } = useTheme()
    const primaryLight = palette.primary.light
    const primaryDark = palette.primary.dark
    const main = palette.neutral.main
    const medium = palette.neutral.medium
    const isNonMobileScreens = useMediaQuery('(min-width:600px)')

    const [isFriend, setIsFriend] = useState(is_friend)
    // Should change the naming. Otherwise this can be very confusing.
    // friend._id is the friend user id while _id is the member of this class, which refers to login user.

    const patchFriend = async () => {
        if (!isAuth) return;
        const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/subscribe/add/${loggedInUserId}/${friendId}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    is_delete: isFriend,
                    'Content-Type': 'application/json',
                },
            }
        )
        const data = await response.json()
        dispatch(
            updateFriends({
                friend: data,
                is_delete: isFriend,
                user_id: friendId,
            })
        )
        setIsFriend(!isFriend)
    }

    return (
        // <></>
        <FlexBetween>
            <FlexBetween
                gap="1rem"
                onClick={() => {
                    navigate(`/profile/${friendId}`);
                    window.location.reload(true); // Force reload, can replace this if a better approach is found.
                }}
            >
                <UserImage
                    image={user_picture_path}
                    size={isNonMobileScreens ? (is_main ? '77px' : '55px') : (is_main ? '50px' : '40px')} // Reduced image size for mobile
                />
                <Box>
                    <Typography
                        color={main}
                        variant={isNonMobileScreens ? (is_main ? 'h3' : 'h5') : 'h6'} // Reduced font size for mobile
                        fontWeight={is_main ? '700' : '500'}
                        sx={{
                            '&:hover': {
                                color: palette.primary.light,
                                cursor: 'pointer',
                            },
                        }}
                    >
                        {name}
                    </Typography>
                    <Typography color={medium} fontSize={isNonMobileScreens ? '0.75rem' : '0.65rem'}> {/* Smaller font size on mobile */}
                        {subscriber}
                    </Typography>
                </Box>
            </FlexBetween>

            {isAuth && action_icon && (
                <IconButton
                    onClick={() => patchFriend()}
                    sx={{
                        backgroundColor: primaryLight,
                        p: isNonMobileScreens ? '0.6rem' : '0.4rem', // Smaller padding on mobile
                    }}
                >
                    {isFriend ? (
                        <PersonRemoveOutlined sx={{ color: primaryDark, fontSize: isNonMobileScreens ? '1.5rem' : '1rem' }} /> // Adjust icon size for mobile
                    ) : (
                        <PersonAddOutlined sx={{ color: primaryDark, fontSize: isNonMobileScreens ? '1.5rem' : '1rem' }} /> // Adjust icon size for mobile
                    )}
                </IconButton>
            )}
        </FlexBetween>
    );
};

export default VirusUser
