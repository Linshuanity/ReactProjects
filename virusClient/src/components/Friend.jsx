import { PersonAddOutlined, PersonRemoveOutlined } from '@mui/icons-material'
import { Box, IconButton, Typography, useTheme } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateFriends } from 'state'
import { useState } from 'react'
import FlexBetween from './FlexBetween'
import UserImage from './UserImage'

const Friend = ({
    friend_id,
    name,
    user_picture_path,
    subscriber,
    is_main = false,
    action_icon = true,
}) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { _id } = useSelector((state) => state.user)
    const friendId = friend_id
    const token = useSelector((state) => state.token)
    const friends = useSelector((state) => state.user.friends)

    const { palette } = useTheme()
    const primaryLight = palette.primary.light
    const primaryDark = palette.primary.dark
    const main = palette.neutral.main
    const medium = palette.neutral.medium

    const [isFriend, setIsFriend] = useState(
        friends !== null &&
            Array.isArray(friends) &&
            friends.some((friend) => friend._id == friend_id)
    ) // Should change the naming. Otherwise this can be very confusing.
    // friend._id is the friend user id while _id is the member of this class, which refers to login user.

    const patchFriend = async () => {
        const response = await fetch(
            `http://localhost:3002/subscribe/add/${_id}/${friendId}`,
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
        <FlexBetween>
            <FlexBetween
                gap="1rem"
                onClick={() => {
                    navigate(`/profile/${friendId}`)
                    window.location.reload(true) // Force reload, can replace this if a better approach is found.
                }}
            >
                <UserImage
                    image={user_picture_path}
                    size={is_main ? '77px' : '55px'}
                />
                <Box>
                    <Typography
                        color={main}
                        variant={is_main ? 'h3' : 'h5'}
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
                    <Typography color={medium} fontSize="0.75rem">
                        {subscriber}
                    </Typography>
                </Box>
            </FlexBetween>
            {action_icon && (
                <IconButton
                    onClick={() => patchFriend()}
                    sx={{ backgroundColor: primaryLight, p: '0.6rem' }}
                >
                    {isFriend ? (
                        <PersonRemoveOutlined sx={{ color: primaryDark }} />
                    ) : (
                        <PersonAddOutlined sx={{ color: primaryDark }} />
                    )}
                </IconButton>
            )}
        </FlexBetween>
    )
}

export default Friend
