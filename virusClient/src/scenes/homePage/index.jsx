import { Box, useMediaQuery, Button, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from 'scenes/navbar'
import UserWidget from 'scenes/widgets/UserWidget'
import MyPostWidget from 'scenes/widgets/MyPostWidget'
import PostsWidget from 'scenes/widgets/PostsWidget'
import MissionWidget from 'scenes/widgets/MissionWidget'
import FriendListWidget from 'scenes/widgets/FriendListWidget'

const HomePage = () => {
    const isNonMobileScreens = useMediaQuery('(min-width:1000px)')
    const { _id, picturePath } = useSelector((state) => state.user) || {}
    const isAuth = Boolean(useSelector((state) => state.token))
    const navigate = useNavigate()

    // Prompt for login
    const handleLoginPrompt = () => {
        navigate('/')
    }

    return (
        <Box>
            <Navbar />
            <Box
                width="100%"
                padding={isNonMobileScreens ? '2rem 6%' : '1rem 2%'}
                display="flex"
                flexDirection={isNonMobileScreens ? 'row' : 'column'}
                gap="1rem"
            >
                {isAuth && (
                    <Box flexBasis={isNonMobileScreens ? '26%' : '100%'}>
                        <UserWidget userId={_id} picturePath={picturePath} />
                    </Box>
                )}

                <Box
                    flexBasis={isAuth && isNonMobileScreens ? '42%' : '100%'}
                    mt={isNonMobileScreens ? undefined : '1rem'}
                >
                    {isAuth ? (
                        <>
                            <MyPostWidget picturePath={picturePath} />
                            <PostsWidget userId={_id} />
                        </>
                    ) : (
                        // <Box>
                        <PostsWidget userId={0} />
                    )}
                </Box>

                {isAuth && isNonMobileScreens && (
                    <Box flexBasis="26%">
                        <MissionWidget />
                        <Box m="2rem 0" />
                        {isAuth ? (
                            <FriendListWidget userId={_id} />
                        ) : (
                            <Typography textAlign="center">
                                Log in to see your friend list.
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    )
}

export default HomePage
