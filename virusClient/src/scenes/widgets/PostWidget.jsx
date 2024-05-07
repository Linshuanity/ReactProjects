import {
    ChatBubbleOutlineOutlined,
    FavoriteBorderOutlined,
    FavoriteOutlined,
    ShareOutlined,
} from '@mui/icons-material'
import Modal from 'react-modal'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import {
    Box,
    Divider,
    IconButton,
    Typography,
    useTheme,
    Button,
    InputBase,
} from '@mui/material'
import FlexBetween from 'components/FlexBetween'
import Friend from 'components/Friend'
import WidgetWrapper from 'components/WidgetWrapper'
import UserImage from 'components/UserImage'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPost } from 'state'

import { MessageProvider, useMessage } from 'components/MessageContext'
import './post_widget.css'

const PostWidget = ({
    post_id,
    owner_id,
    owner_name,
    owner_profile,
    author_id,
    author_name,
    author_profile,
    level,
    description,
    location,
    create_date,
    expire_date,
    picturePath,
    bid_user_id,
    is_liked,
    likes,
    bid_price,
    ask_price,
    my_bid,
    comments,
}) => {
    const [listMode, setListMode] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [newComment, setNewComment] = useState('')
    const postId = post_id
    const dispatch = useDispatch()
    const token = useSelector((state) => state.token)
    const loggedInUserId = useSelector((state) => state.user._id)
    const loggedInUserName = useSelector((state) => state.user.user_name)
    const userImagePath = useSelector((state) => state.user.picturePath)
    const isSell = loggedInUserId === owner_id
    const price = isSell ? bid_price : ask_price
    const [bid, setBid] = useState('0')
    const [myBid, setMyBid] = useState(my_bid)
    const [isLiked, setLiked] = useState(is_liked)
    const [likesCount, setLikes] = useState(likes)
    const startDate = [create_date]
    const currentTime = new Date()
    const start = new Date(startDate)
    const durationInMs = 12 * 3.6e6 * (6 + Math.sqrt(likesCount))
    const end = new Date(start.getTime() + durationInMs)
    const isAlive = currentTime <= end
    const [rewardValueMsg, setRewardValue] = useState(0)

    const { palette } = useTheme()
    const main = palette.neutral.main
    const primary = palette.primary.main
    const navigate = useNavigate()
    const [commentCount, setCommentCount] = useState(comments)
    const [commentList, setCommentList] = useState([])
    const [bidList, setBidList] = useState([])
    const [ConfirmationState, setConfirmationState] = useState(0)
    const { showMessage } = useMessage()

    const handleAddBid = async () => {
        const response = await fetch(`http://localhost:3002/posts/bid`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: loggedInUserId,
                post_id: postId,
                price: bid,
                is_bid: loggedInUserId !== owner_id,
            }),
        })
        const update = await response.json()
        console.log(update)
        if (update.status == 'ok') {
            setMyBid(bid)
        }
        setConfirmationState(false)
    }
    const handleAddComment = async () => {
        try {
            if (newComment.trim() !== '') {
                const response = await fetch(
                    `http://localhost:3002/posts/comment`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: loggedInUserId,
                            post_id: postId,
                            context: newComment,
                        }),
                    }
                )

                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }

                const update = await response.json()
                const commentObject = {
                    cid: update.cid,
                    context: newComment,
                    user_name: loggedInUserName,
                    user_image_path: userImagePath,
                    isLiked: 0,
                    likes: 0,
                }
                setCommentList([...commentList, commentObject])
                setCommentCount((commentCount) => commentCount + 1)
            }

            setNewComment('')
        } catch (error) {
            console.error('Error occurred:', error)
            showMessage(
                `An error occurredwhile adding the comment: ${error.message}`,
                3000
            )
        }
    }

    const purchaseAction = async () => {
        try {
            const response = await fetch(
                `http://localhost:3002/posts/purchase`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        trader_id: loggedInUserId,
                        post_id: postId,
                        user_id: isSell ? bid_user_id : owner_id,
                        for_sell: isSell,
                        price: price,
                    }),
                }
            )
            const update = await response.json()
            setConfirmationState(false)
            if (update.successful)
                showMessage('Transaction done.', 1000, 'message-box-green')
            else showMessage('Not enough virus.', 1000, 'message-box-red')
        } catch (error) {
            showMessage(
                `Server error: ${error.message}`,
                3000,
                'message-box-red'
            )
        }
    }

    const fetchBids = async () => {
        if (listMode !== 2) {
            const response = await fetch('http://localhost:3002/posts/bids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ post_id: postId }),
            })
            const update = await response.json()
            setBidList(update)
        }
        setListMode(listMode === 2 ? 0 : 2)
    }

    const fetchComments = async () => {
        if (listMode !== 1) {
            const response = await fetch(
                'http://localhost:3002/posts/comments',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: loggedInUserId,
                        post_id: postId,
                    }),
                }
            )
            const update = await response.json()
            setCommentList(update)
        }
        setListMode(listMode === 1 ? 0 : 1)
    }

    const patchLike = async () => {
        setLikes(likesCount + (isLiked ? -1 : 1))
        setLiked(!isLiked)
        const response = await fetch(`http://localhost:3002/posts/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                liker_id: loggedInUserId,
                post_id: postId,
                is_liked: isLiked,
            }),
        })
        const update = await response.json()
        if (!isLiked) {
            if (update.reward > 0)
                showMessage(
                    'You made ' + update.reward + ' virus',
                    3000,
                    'message-box-green'
                )
        }
    }

    const patchCommentLike = async (index, commentIsLiked, cid, c_isLiked) => {
        const updatedCommentList = commentList.map((comment, i) =>
            i === index
                ? {
                      ...comment,
                      isLiked: !commentIsLiked,
                      likes: (commentIsLiked ? -1 : 1) + comment.likes,
                  }
                : comment
        )
        setCommentList(updatedCommentList)
        const response = await fetch(
            `http://localhost:3002/posts/commentlike`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    liker_id: loggedInUserId,
                    comment_id: cid,
                    is_liked: c_isLiked,
                }),
            }
        )
        const update = await response.json()
    }

    const handleCopyToClipboard = () => {
        const shareURL = `https://localhost:3000/post/${post_id}` // Replace with your actual URL
        copyToClipboard(shareURL)
    }

    function copyToClipboard(text) {
        const textarea = document.createElement('textarea')
        textarea.value = text
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        showMessage('Url copied to clipboard.', 1000, 'message-box-green')
    }

    function formatTimeLeft(time) {
        const days = Math.floor(time / (1000 * 60 * 60 * 24))
        const hours = Math.floor(
            (time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        )
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((time % (1000 * 60)) / 1000)

        let formattedTime = ''
        if (days > 0) {
            formattedTime += `${days} day${days > 1 ? 's' : ''} `
        }
        if (hours > 0) {
            formattedTime += `${hours} hr${hours > 1 ? 's' : ''} `
        }
        if (minutes > 0) {
            formattedTime += `${minutes} min${minutes > 1 ? 's' : ''} `
        }

        return formattedTime.trim()
    }

    function calculateProgress() {
        const totalTime = end.getTime() - start.getTime()
        const elapsedTime = currentTime.getTime() - start.getTime()
        const timeLeft =
            end > currentTime ? end - currentTime : currentTime - end
        const formattedTimeLeft = formatTimeLeft(timeLeft)
        const progress = (elapsedTime / totalTime) * 100

        return { progress: progress.toFixed(2), timeLeft: formattedTimeLeft }
    }

    return (
        <WidgetWrapper
            style={{
                backgroundColor: isAlive ? palette.neutral.gray : '#888888',
                margin: '1rem 0',
            }}
        >
            <Friend
                friend_id={author_id}
                name={author_name}
                subscriber={''}
                user_picture_path={author_profile}
                action_icon={false}
            />
            <Typography color={main} sx={{ mt: '1rem' }}>
                {description}
            </Typography>
            {picturePath && (
                <div style={{ position: 'relative' }}>
                    <img
                        width="100%"
                        height="auto"
                        alt="post"
                        style={{
                            borderRadius: '0.75rem',
                            marginTop: '0.75rem',
                        }}
                        src={`http://localhost:3002/assets/${picturePath}`}
                    />
                    <img
                        src={`http://localhost:3002/assets/${picturePath}?123`}
                        alt="Foreground Photo"
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '10%',
                            height: '10%',
                            zIndex: 1,
                        }}
                    />
                </div>
            )}
            {start &&
                end &&
                (() => {
                    const { progress, timeLeft } = calculateProgress()

                    return (
                        <div style={{ flex: '1', marginLeft: '1rem' }}>
                            {isAlive && (
                                <progress
                                    value={progress}
                                    max="100"
                                    style={{ width: '100%' }}
                                >
                                    {progress}%
                                </progress>
                            )}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Box
                                    width="50%"
                                    onClick={() => {
                                        navigate(`/profile/${owner_id}`)
                                        navigate(0)
                                    }}
                                    onMouseOver={() => setIsHovered(true)}
                                    onMouseOut={() => setIsHovered(false)}
                                >
                                    {isHovered ? (
                                        <div>{owner_name}</div>
                                    ) : (
                                        <UserImage
                                            image={owner_profile}
                                            size="22px"
                                        />
                                    )}
                                </Box>
                                <div
                                    style={{ width: '50%', textAlign: 'right' }}
                                >
                                    {isAlive ? '' : 'Expired'} {timeLeft}{' '}
                                    {isAlive ? `left` : 'ago'}
                                </div>
                            </div>
                        </div>
                    )
                })()}
            <FlexBetween mt="0.25rem">
                <FlexBetween gap="1rem">
                    <FlexBetween gap="0.3rem">
                        <IconButton onClick={patchLike}>
                            {isLiked ? (
                                <FavoriteOutlined sx={{ color: primary }} />
                            ) : (
                                <FavoriteBorderOutlined />
                            )}
                        </IconButton>
                        <Typography>{likesCount}</Typography>
                    </FlexBetween>

                    <FlexBetween gap="0.3rem">
                        <IconButton onClick={fetchComments}>
                            <ChatBubbleOutlineOutlined />
                        </IconButton>
                        <Typography>{commentCount}</Typography>
                    </FlexBetween>

                    <FlexBetween gap="0.3rem">
                        <IconButton onClick={fetchBids}>
                            <ShoppingCartIcon />
                        </IconButton>
                        <Button
                            sx={{
                                backgroundColor: isSell ? '#FFAF00' : '#00AFFF',
                                padding: '2px 4px',
                                color: 'white',
                                marginLeft: '0.5rem',
                            }}
                            variant="contained"
                            onClick={() => {
                                setConfirmationState(1)
                            }}
                            disabled={price <= 0}
                        >
                            {(isSell ? 'Sell @ ' : 'Buy @ ') +
                                (price <= 0 ? 0 : price)}
                        </Button>
                        <Button
                            sx={{
                                backgroundColor: isSell ? '#FFAF00' : '#00AFFF',
                                padding: '2px 4px',
                                color: 'white',
                                minWidth: '50px',
                                '&:hover': {
                                    backgroundColor: isSell
                                        ? '#FFD98D !important'
                                        : '#6DD4FF !important',
                                },
                            }}
                            variant="contained"
                            onClick={() => setConfirmationState(2)}
                            disabled={bid <= 0}
                        >
                            {(isSell ? 'Ask (' : 'Bid (') + myBid + ')'}
                        </Button>
                        <InputBase
                            type="number"
                            placeholder="set price"
                            onChange={(e) => setBid(e.target.value)}
                            value={bid}
                            sx={{
                                width: '6rem',
                                height: '2rem',
                                backgroundColor: palette.neutral.light,
                                borderRadius: '1rem',
                                padding: '0.5rem 0.5rem',
                            }}
                        />
                        <Modal
                            isOpen={ConfirmationState > 0}
                            onRequestClose={() => setConfirmationState(0)}
                            ariaHideApp={false}
                            className="custom-modal" // Apply your custom CSS class
                        >
                            {ConfirmationState === 1 ? (
                                <div className="custom-modal-content">
                                    <p style={{ color: 'black' }}>
                                        Are you sure you want to{' '}
                                        {isSell ? 'sell' : 'buy'} at ${price}?
                                    </p>
                                    <div className="button-container">
                                        <button
                                            className="yes-button"
                                            onClick={purchaseAction}
                                        >
                                            Yes
                                        </button>
                                        <button
                                            className="no-button"
                                            onClick={() =>
                                                setConfirmationState(0)
                                            }
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="custom-modal-content">
                                    <p style={{ color: 'black' }}>
                                        Are you sure you want to place{' '}
                                        {isSell ? 'an ask' : 'a bid'} at ${bid}?
                                    </p>
                                    <div className="button-container">
                                        <button
                                            className="yes-button"
                                            onClick={handleAddBid}
                                        >
                                            Yes
                                        </button>
                                        <button
                                            className="no-button"
                                            onClick={() =>
                                                setConfirmationState(0)
                                            }
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Modal>
                    </FlexBetween>
                </FlexBetween>

                <IconButton onClick={handleCopyToClipboard}>
                    <ShareOutlined />
                </IconButton>
            </FlexBetween>
            {(listMode === 1 && (
                <Box mt="1rem">
                    {commentList.map((comment, i) => (
                        <Box key={`${author_name}-${i}`}>
                            <Divider />
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: '0.5rem',
                                }}
                            >
                                <UserImage
                                    image={comment.user_image_path}
                                    size="22px"
                                />
                                <Box sx={{ ml: '0.5rem' }}>
                                    <FlexBetween gap="0.3rem">
                                        <Typography variant="subtitle2">
                                            {comment.user_name}
                                        </Typography>
                                        <IconButton
                                            onClick={() =>
                                                patchCommentLike(
                                                    i,
                                                    comment.isLiked,
                                                    comment.cid,
                                                    comment.isLiked
                                                )
                                            }
                                        >
                                            {comment.isLiked ? (
                                                <FavoriteOutlined
                                                    sx={{ color: primary }}
                                                />
                                            ) : (
                                                <FavoriteBorderOutlined />
                                            )}
                                        </IconButton>
                                        <Typography>{comment.likes}</Typography>
                                    </FlexBetween>
                                    <Typography color={main}>
                                        {comment.context}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                    <Divider />
                </Box>
            )) ||
                (listMode === 2 && (
                    <Box mt="1rem">
                        {bidList.map((bid, i) => (
                            <Box key={`${author_name}-${i}`}>
                                <Divider />
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: '0.5rem',
                                    }}
                                >
                                    <UserImage
                                        image={bid.user_image_path}
                                        size="22px"
                                    />
                                    <Box sx={{ ml: '0.5rem' }}>
                                        <Typography variant="subtitle2">
                                            {bid.user_name}
                                        </Typography>
                                        <Typography color={main}>
                                            {bid.price}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                        <Divider />
                    </Box>
                ))}
            <Box mt="1rem" display="flex" alignItems="center">
                <InputBase
                    type="text"
                    placeholder="leave a comment"
                    value={newComment}
                    onChange={(event) => {
                        setNewComment(event.target.value)
                    }}
                    sx={{
                        flex: 1,
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddComment}
                    sx={{
                        color: palette.background.alt,
                        backgroundColor: palette.primary.main,
                        borderRadius: '3rem',
                    }}
                    disabled={!isAlive}
                >
                    Send
                </Button>
            </Box>
        </WidgetWrapper>
    )
}

export default PostWidget
