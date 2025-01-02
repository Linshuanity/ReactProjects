import { Box, useMediaQuery, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Navbar from 'scenes/navbar'
import UserWidget from 'scenes/widgets/UserWidget'
import PostWidget from 'scenes/widgets/PostWidget'
import MissionWidget from 'scenes/widgets/MissionWidget'
import FriendListWidget from 'scenes/widgets/FriendListWidget'

// const apiEndpoint = process.env.REACT_APP_API_ENDPOINT; // 使用環境變量
const apiEndpoint = process.env.REACT_APP_SERVER_URL

const PostPage = () => {
    const [post, setPost] = useState(null)
    const isNonMobileScreens = useMediaQuery('(min-width:1000px)')
    const { _id, picturePath } = useSelector((state) => state.user) || {}
    const loggedInUserId = useSelector((state) => state.user?._id)
    const isAuth = Boolean(useSelector((state) => state.token))
    const { postId } = useParams()

    const getPost = async () => {
        const response = await fetch(`${apiEndpoint}/posts/${postId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                post_id: postId,
                login_user: isAuth ? loggedInUserId : 0,
            }),
        })
        const data = await response.json()
        setPost(data)
    }

    useEffect(() => {
        getPost()
    }, [])

    return (
        <Box>
            <Navbar />
            <Box
                width="100%"
                padding="2rem 6%"
                display={isNonMobileScreens ? 'flex' : 'block'}
                gap="0.5rem"
                justifyContent="space-between"
            >
                {isAuth && (
                    <Box flexBasis={isNonMobileScreens ? '26%' : undefined}>
                        <UserWidget userId={_id} picturePath={picturePath} />
                    </Box>
                )}

                <Box
                    flexBasis={isAuth && isNonMobileScreens ? '42%' : '100%'}
                    mt={isNonMobileScreens ? undefined : '2rem'}
                >
                    {post == null
                        ? ''
                        : post.map((_post) => (
                            <PostWidget
                                key={_post.pid}
                                post_id={_post.pid}
                                owner_id={_post.owner_uid}
                                owner_name={_post.owner_name}
                                owner_profile={_post.owner_profile}
                                author_id={_post.author_uid}
                                author_name={_post.author_name}
                                author_profile={_post.author_profile}
                                level={_post.level}
                                description={_post.title}
                                location="Taipei" // 需要根據實際數據進行動態設置
                                create_date={_post.create_date}
                                expire_date={_post.expire_date}
                                picturePath={_post.image_path}
                                bid_user_id={_post.bid_user_id}
                                bid_price={_post.bid_price}
                                ask_price={_post.ask_price}
                                is_liked={_post.is_liked}
                                likes={_post.likes}
                                my_bid={_post.my_bid}
                                comments={_post.comments}
                            />
                        ))}
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

export default PostPage