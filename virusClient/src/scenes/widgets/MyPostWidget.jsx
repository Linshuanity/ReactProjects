import {
    EditOutlined,
    DeleteOutlined,
    AttachFileOutlined,
    GifBoxOutlined,
    ImageOutlined,
    MicOutlined,
    MoreHorizOutlined,
} from '@mui/icons-material'
import {
    Box,
    Divider,
    Typography,
    InputBase,
    useTheme,
    Button,
    IconButton,
    useMediaQuery,
} from '@mui/material'
import Modal from 'react-modal'
import FlexBetween from 'components/FlexBetween'
import Dropzone from 'react-dropzone'
import UserImage from 'components/UserImage'
import WidgetWrapper from 'components/WidgetWrapper'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPosts } from 'state'
import { MessageProvider, useMessage } from 'components/MessageContext'

const MyPostWidget = ({ picturePath }) => {
    const dispatch = useDispatch()
    const [isImage, setIsImage] = useState(false)
    const [image, setImage] = useState(null)
    const [post, setPost] = useState('')
    const [price, setPrice] = useState('')
    const [confirmationState, setConfirmationState] = useState(0)
    const { palette } = useTheme()
    const { _id } = useSelector((state) => state.user)
    const { showMessage } = useMessage()
    const token = useSelector((state) => state.token)
    const isNonMobileScreens = useMediaQuery('(min-width: 1000px)')
    const mediumMain = palette.neutral.mediumMain
    const medium = palette.neutral.medium
    const [isProcessing, setIsProcessing] = useState(false);
    const postPrice = 1;

    const handlePost = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const formData = new FormData()
            formData.append('userId', _id)
            formData.append('content', post)
            formData.append('price', price)
            if (image) {
                formData.append('picture', image)
                formData.append('picturePath', image.name)
            }

            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/posts/createPost`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            })
            const posts = await response.json()
            setConfirmationState(false)
            if (posts.success) {
                setImage(null)
                setPost('')
                window.location.reload(true)
            }
            else
                showMessage('Not enough virus.', 1000, 'message-box-red')
        } catch (error) {
            console.error('Error adding bid:', error);
            showMessage('Error occurred while processing bid.', 1000, 'message-box-red');
        } finally {
            setIsProcessing(false);
            setConfirmationState(false)
        }
    }

    return (
        <WidgetWrapper>
            <FlexBetween gap="1.5rem">
                <UserImage image={picturePath} />
                <InputBase
                    placeholder="Add some description..."
                    onChange={(e) => setPost(e.target.value)}
                    value={post}
                    sx={{
                        width: '100%',
                        backgroundColor: palette.neutral.light,
                        borderRadius: '2rem',
                        padding: '1rem 2rem',
                    }}
                />
            </FlexBetween>
            {isImage && (
                <Box
                    border={`1px solid ${medium}`}
                    borderRadius="5px"
                    mt="1rem"
                    p="1rem"
                >
                    <Dropzone
                        acceptedFiles=".jpg,.jpeg,.png"
                        multiple={false}
                        onDrop={(acceptedFiles) => setImage(acceptedFiles[0])}
                    >
                        {({ getRootProps, getInputProps }) => (
                            <FlexBetween>
                                <Box
                                    {...getRootProps()}
                                    border={`2px dashed ${palette.primary.main}`}
                                    p="1rem"
                                    width="100%"
                                    sx={{ '&:hover': { cursor: 'pointer' } }}
                                >
                                    <input {...getInputProps()} />
                                    {!image ? (
                                        <p>Add Image Here</p>
                                    ) : (
                                        <FlexBetween>
                                            <Typography>
                                                {image.name}
                                            </Typography>
                                            <EditOutlined />
                                        </FlexBetween>
                                    )}
                                </Box>
                                {image && (
                                    <IconButton
                                        onClick={() => setImage(null)}
                                        sx={{ width: '15%' }}
                                    >
                                        <DeleteOutlined />
                                    </IconButton>
                                )}
                            </FlexBetween>
                        )}
                    </Dropzone>
                </Box>
            )}

            <Divider sx={{ margin: '1.25rem 0' }} />

            <FlexBetween>
                <FlexBetween gap="0.25rem" onClick={() => setIsImage(!isImage)}>
                    <ImageOutlined sx={{ color: mediumMain }} />
                    <Typography
                        color={mediumMain}
                        sx={{ '&:hover': { cursor: 'pointer', color: medium } }}
                    >
                        Image
                    </Typography>
                </FlexBetween>
                <FlexBetween gap="0.25rem">
                    <Typography
                        color={mediumMain}
                        variant="body2"
                        sx={{
                            fontWeight: 'bold',
                            marginRight: '0.5rem',
                        }}
                    >
                        Cost: $ {postPrice} {/* Replace with actual number state or variable */}
                    </Typography>
                    <Button
                        disabled={!post}
                        onClick={() => setConfirmationState(1)}
                        sx={{
                            color: palette.background.alt,
                            backgroundColor: palette.primary.main,
                            borderRadius: '3rem',
                        }}
                    >
                        POST
                    </Button>
                </FlexBetween>
                <Modal
                    isOpen={confirmationState > 0}
                    onRequestClose={() => setConfirmationState(0)}
                    ariaHideApp={false}
                    className="custom-modal" // Apply your custom CSS class
                >
                    {confirmationState === 1 && (
                        <div className="custom-modal-content">
                            <p style={{ color: 'black' }}>
                                This will cost you $1.
                                Are you sure you want to post?
                            </p>
                            <div className="button-container">
                                <button
                                    className={`yes-button ${isProcessing ? 'processing' : ''}`}
                                    onClick={handlePost}
                                    disabled={isProcessing}
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
        </WidgetWrapper>
    )
}

export default MyPostWidget
