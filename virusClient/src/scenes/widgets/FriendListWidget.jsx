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
    const login_id = useSelector((state) => state.user._id)
    const [friends, setFriends] = useState(null)
    let friendDiv = <></>
    try {
        friendDiv = friends
          .sort((a, b) => {
            // Sort by `is_friend` (true comes first)
            if (a.is_friend === b.is_friend) return 0;
            return a.is_friend ? -1 : 1;  // true values come first
          })
          .map((friend) => (
            <Friend
              key={friend._id}
              friend_id={friend._id}
              name={friend.name}
              subscriber={''}
              is_friend={friend.is_friend}
              user_picture_path={friend.picturePath}
            />
          ))
    } catch (error) {}

    const getFriends = async () => {
        const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/subscribe/friends/${userId}`,
            {
                method: 'GET',
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'login_id': login_id,
                },
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
                variant="h4"
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
