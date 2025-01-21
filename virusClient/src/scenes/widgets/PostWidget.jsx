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
import VirusUser from 'components/VirusUser'
import WidgetWrapper from 'components/WidgetWrapper'
import UserImage from 'components/UserImage'
import { useNavigate } from 'react-router-dom'
import { useState, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPost } from 'state'
import FloatLogin from 'components/FloatLogin' // 引入 FloatLogin
import { LanguageContext, messages } from 'components/LanguageContext';

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
    is_liked: initialIsLiked, // 將 is_liked 更名為 initialIsLiked
    likes: initialLikes, // 將 likes 更名為 initialLikes
    bid_price,
    ask_price,
    my_bid,
    comments: initialComments, // 將 comments 更名為 initialComments
}) => {
    const { currentLanguage } = useContext(LanguageContext);
    const [listMode, setListMode] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [newComment, setNewComment] = useState('')
    const postId = post_id
    const dispatch = useDispatch()
    const token = useSelector((state) => state.token)
    const isAuth = Boolean(token); // 是否登入
    const loggedInUserId = useSelector((state) => state.user?._id)
    const loggedInUserName = useSelector((state) => state.user?.user_name)
    const userImagePath = useSelector((state) => state.user?.picturePath)
    const isSell = loggedInUserId === owner_id
    const price = isSell ? bid_price : ask_price
    const [bid, setBid] = useState(0)
    const [myBid, setMyBid] = useState(my_bid)
    const [isLiked, setLiked] = useState(initialIsLiked) // 使用 initialIsLiked 初始化
    const [likesCount, setLikes] = useState(initialLikes) // 使用 initialLikes 初始化
    const startDate = [create_date]
    const endDate = [expire_date]
    const currentTime = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    const isAlive = currentTime <= end
    const [rewardValueMsg, setRewardValue] = useState(0)

    const { palette } = useTheme()
    const main = palette.neutral.main
    const primary = palette.primary.main
    const navigate = useNavigate()
    const [commentCount, setCommentCount] = useState(initialComments) // 使用 initialComments 初始化
    const [commentList, setCommentList] = useState([])
    const [bidList, setBidList] = useState([])
    const [confirmationState, setConfirmationState] = useState(0)
    const { showMessage } = useMessage()
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // 控制浮動登入視窗

    const youtubeRegex = /(https?:\/\/(?:www\.)?youtube\.com\/(?:[^\/\n\s]+\/\S+|\S+))/i;
    const youtubeLinkMatch = description.match(youtubeRegex);

    const handleCloseLoginModal = () => {
        setIsLoginModalOpen(false);
    };

    const handleAddBid = async () => {
        if (!isAuth) {
            setIsLoginModalOpen(true);
            return;
        }
        setIsProcessing(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/posts/bid`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: loggedInUserId,
                    post_id: postId,
                    price: Number(bid),
                    is_bid: loggedInUserId !== owner_id,
                }),
            })
            const update = await response.json()
            setConfirmationState(false)
            if (update.successful)
                showMessage(`Updated at ${bid}`, 1000, 'message-box-green')
            else showMessage('Not enough virus.', 1000, 'message-box-red')
        } catch (error) {
            console.error('Error adding bid:', error);
            showMessage('Error occurred while processing bid.', 1000, 'message-box-red');
        } finally {
            setIsProcessing(false);
            setConfirmationState(false)
        }
    }
    const handleAddComment = async () => {
        if (!isAuth) {
            setIsLoginModalOpen(true);
            return;
        }
        setIsProcessing(true);
        try {
            if (newComment.trim() !== '') {
                const response = await fetch(
                    `${process.env.REACT_APP_SERVER_URL}/posts/comment`,
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
                    user_id: loggedInUserId,
                    user_name: loggedInUserName,
                    user_image_path: userImagePath,
                    isLiked: 0,
                    likes: 0,
                }
                setCommentList([...commentList, commentObject])
                setCommentCount((prevCount) => prevCount + 1)
            }

            setNewComment('')
        } catch (error) {
            console.error('Error occurred:', error)
            showMessage(
                `An error occurredwhile adding the comment: ${error.message}`,
                3000
            )
        } finally {
            setIsProcessing(false);
        }
    }

    const purchaseAction = async () => {
        if (!isAuth) {
            setIsLoginModalOpen(true);
            return;
        }
        setIsProcessing(true);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/posts/purchase`,
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
        } finally {
            setIsProcessing(false);
        }
    }

    const refuelAction = async () => {
        if (!isAuth) {
            setIsLoginModalOpen(true);
            return;
        }
        setIsProcessing(true);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/posts/refuel`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        doner_id: loggedInUserId,
                        post_id: postId,
                        price: Number(bid),
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
        } finally {
            setIsProcessing(false);
        }
    }

    const fetchBids = async () => {
        if (!isAuth) {
            setIsLoginModalOpen(true);
            return;
        }
        if (listMode !== 2) {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/posts/bids`, {
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
        if (!isAuth) {
            setIsLoginModalOpen(true);
            return;
        }
        if (listMode !== 1) {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/posts/comments`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: isAuth ? loggedInUserId : 0,
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
        if (!isAuth) {
            setIsLoginModalOpen(true);
            return;
        }
        // Disable unlike
        if (isLiked)
            return;
        setLikes(likesCount + (isLiked ? -1 : 1))
        setLiked(!isLiked)
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/posts/like`, {
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

    const patchCommentLike = async (index, commentIsLiked, cid) => {
        if (!isAuth) {
            setIsLoginModalOpen(true);
            return;
        }
        // Disable unlike
        if (commentIsLiked)
            return;
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
            `${process.env.REACT_APP_SERVER_URL}/posts/commentlike`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    liker_id: loggedInUserId,
                    comment_id: cid,
                    is_liked: commentIsLiked,
                }),
            }
        )
        const update = await response.json()
    }

    const handleCopyToClipboard = () => {
        const baseURL = `${window.location.origin}`; // 獲取目前網站的基礎 URL
        const shareURL = `${baseURL}/post/${post_id}`; // 動態生成分享連結
        copyToClipboard(shareURL);
    };

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
            formattedTime += `${days} ${messages[currentLanguage]?.days} `
        }
        if (hours > 0) {
            formattedTime += `${hours} ${messages[currentLanguage]?.hrs} `
        }
        if (minutes > 0) {
            formattedTime += `${minutes} ${messages[currentLanguage]?.mins}`
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
            <FloatLogin isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} /> {/* 渲染浮動視窗 */}
            <VirusUser
                friend_id={author_id}
                name={author_name}
                subscriber={''}
                user_picture_path={author_profile}
                action_icon={false}
            />
            <Typography color={main} sx={{ mt: '1rem' }}>
                {youtubeLinkMatch ? (
                    <Box sx={{ width: '100%', position: 'relative', paddingBottom: '56.25%' }}>
                        <iframe
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            src={`https://www.youtube.com/embed/${youtubeLinkMatch[1].split('v=')[1]}`}
                            title="YouTube video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </Box>
                ) : (
                    <pre>{description}</pre>
                )}
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
                        src={`${process.env.REACT_APP_SERVER_URL}/assets/${picturePath}`}
                    />
                    <img
                        src={`${process.env.REACT_APP_SERVER_URL}/assets/${picturePath}?123`}
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
                                    {isAlive ? '' : messages[currentLanguage]?.expired} {timeLeft}{' '}
                                    {isAlive ? messages[currentLanguage]?.left : messages[currentLanguage]?.ago}
                                </div>
                            </div>
                        </div>
                    )
                })()}
            <FlexBetween mt="0.25rem">
                <FlexBetween gap="2rem">
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
                    </FlexBetween>
                </FlexBetween>

                <IconButton onClick={handleCopyToClipboard}>
                    <ShareOutlined />
                </IconButton>
            </FlexBetween>
            <FlexBetween>
                <FlexBetween gap="1rem">
                    <Button
                        sx={{
                            backgroundColor: isSell ? '#FFAF00' : '#00AFFF',
                            padding: '2px 4px',
                            color: 'white',
                            marginLeft: '0.5rem',
                        }}
                        variant="contained"
                        onClick={() => {
                            if (!isAuth) {
                                setIsLoginModalOpen(true);
                                return;
                            }
                            setConfirmationState(1)
                        }}
                        disabled={price <= 0}
                    >
                        {(isSell ? messages[currentLanguage]?.sell : messages[currentLanguage]?.buy) + ' @ ' +
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
                        onClick={() => {
                            if (!isAuth) {
                                setIsLoginModalOpen(true);
                                return;
                            }
                            setConfirmationState(2)
                        }}
                        disabled={bid < 0 || (bid == 0 && myBid == 0)}
                    >
                        {(isSell ? messages[currentLanguage]?.ask + ' (' : messages[currentLanguage]?.bid + ' (') + myBid + ')'}
                    </Button>
                    <Button
                        sx={{
                            backgroundColor: '#FFAF00',
                            padding: '2px 4px',
                            color: 'white',
                            '&:hover': '#FFD98D'
                        }}
                        variant="contained"
                        onClick={() => {
                            if (!isAuth) {
                                setIsLoginModalOpen(true);
                                return;
                            }
                            setConfirmationState(3)
                        }}
                        disabled={bid < 0 || (bid == 0 && myBid == 0)}
                    >
                        {messages[currentLanguage]?.tip}
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
                        isOpen={confirmationState > 0}
                        onRequestClose={() => setConfirmationState(0)}
                        ariaHideApp={false}
                        className="custom-modal" // Apply your custom CSS class
                    >
                        {confirmationState === 1 ? (
                            <div className="custom-modal-content">
                                <p style={{ color: 'black' }}>
                                    {messages[currentLanguage]?.are_you_sure_you_want_to + ' '}
                                    {isSell ? messages[currentLanguage]?.sell_at : messages[currentLanguage]?.buy_at} ${price}?
                                </p>
                                <div className="button-container">
                                    <button
                                        className={`yes-button ${isProcessing ? 'processing' : ''}`}
                                        disabled={isProcessing}
                                        onClick={purchaseAction}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className="no-button"
                                        disabled={isProcessing}
                                        onClick={() =>
                                            setConfirmationState(0)
                                        }
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        ) : confirmationState === 2 ? (
                            <div className="custom-modal-content">
                                <p style={{ color: 'black' }}>
                                    Are you sure you want to place{' '}
                                    {isSell ? messages[currentLanguage]?.ask_at : messages[currentLanguage]?.bid_at} ${bid}?
                                </p>
                                <div className="button-container">
                                    <button
                                        className={`yes-button ${isProcessing ? 'processing' : ''}`}
                                        disabled={isProcessing}
                                        onClick={handleAddBid}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className="no-button"
                                        disabled={isProcessing}
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
                                    Are you sure you want to refill ${bid}?
                                </p>
                                <div className="button-container">
                                    <button
                                        className={`yes-button ${isProcessing ? 'processing' : ''}`}
                                        disabled={isProcessing}
                                        onClick={refuelAction}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className="no-button"
                                        disabled={isProcessing}
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
                                                    comment.cid
                                                )
                                            }
                                            disabled={comment.user_id === loggedInUserId}
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
                    placeholder={messages[currentLanguage]?.leave_a_comment}
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
                    {messages[currentLanguage]?.send}
                </Button>
            </Box>
        </WidgetWrapper>
    )
}

export default PostWidget
