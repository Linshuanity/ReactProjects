import { Box, useMediaQuery } from '@mui/material'
import { useSelector } from 'react-redux'
import Navbar from 'scenes/navbar'
import UserWidget from 'scenes/widgets/UserWidget'
import MyPostWidget from 'scenes/widgets/MyPostWidget'
import PostsWidget from 'scenes/widgets/PostsWidget'
import MissionWidget from 'scenes/widgets/MissionWidget'
import FriendListWidget from 'scenes/widgets/FriendListWidget'

const HomePage = () => {
    const isNonMobileScreens = useMediaQuery('(min-width:1000px)')
    const { _id, picturePath } = useSelector((state) => state.user)
    return (
        <Box>
            <Navbar />
            <Box
                width="100%"
                padding={isNonMobileScreens ? "2rem 6%" : "1rem 2%"} // Adjust padding for mobile
                display="flex"
                flexDirection={isNonMobileScreens ? "row" : "column"} // Stack on mobile
                gap="1rem" // Increased gap for better spacing
            >
                <Box flexBasis={isNonMobileScreens ? '26%' : '100%'}> {/* Full width on mobile */}
                    <UserWidget userId={_id} picturePath={picturePath} />
                </Box>
                {!isNonMobileScreens && ( // Display these widgets for mobile
                    <Box
                        display="flex"
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="flex-start"  // Aligns widgets at the top if they vary in height
                        gap="1rem"               // Adjust gap for spacing between widgets
                        mt="1rem"
                        width="100%"             // Ensures the container is full-width
                    >
                        <MissionWidget />
                        <FriendListWidget userId={_id} />
                    </Box>
                )}
                <Box
                    flexBasis={isNonMobileScreens ? '42%' : '100%'}
                    mt={isNonMobileScreens ? undefined : '1rem'} // Smaller top margin on mobile
                >
                    <MyPostWidget picturePath={picturePath} />
                    <PostsWidget userId={_id} />
                </Box>
                {isNonMobileScreens && (
                    <Box flexBasis="26%">
                        <MissionWidget />
                        <Box m="2rem 0" />
                        <FriendListWidget userId={_id} />
                    </Box>
                )}
            </Box>
        </Box>
    )
}

export default HomePage
