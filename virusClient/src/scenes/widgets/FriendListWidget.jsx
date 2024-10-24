import { Box, Typography, useTheme } from '@mui/material'
import Friend from 'components/Friend'
import WidgetWrapper from 'components/WidgetWrapper'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFriends } from 'state'

const FriendListWidget = ({ userId }) => {
    const dispatch = useDispatch()
    const { palette } = useTheme()
    const token = useSelector((state) => state.token)
    const [friends, setFriends] = useState(null)
    let friendDiv = <></>
    try {
        friendDiv = friends.map((friend) => (
            <Friend
                key={friend._id}
                friend_id={friend._id}
                name={friend.name}
                subscriber={''}
                user_picture_path={friend.picturePath}
            />
        ))
    } catch (error) {}

    const getFriends = async () => {
        const response = await fetch(
            `http://localhost:3002/subscribe/friends/${userId}`,
            {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            }
        )
        const data = await response.json()
        setFriends(data)
    }

    useEffect(() => {
        getFriends()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <WidgetWrapper>
            <Typography
                color={palette.neutral.dark}
                variant="h5"
                fontWeight="500"
                sx={{ mb: '1.5rem' }}
            >
                Following
            </Typography>
            <Box display="flex" flexDirection="column" gap="1.5rem">
                {friendDiv}
            </Box>
        </WidgetWrapper>
    )
}

export default FriendListWidget
