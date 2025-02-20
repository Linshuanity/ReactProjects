import {
    ManageAccountsOutlined,
    EditOutlined,
    LocationOnOutlined,
    WorkOutlineOutlined,
} from '@mui/icons-material'
import { Box, Typography, Divider, useTheme } from '@mui/material'
import UserImage from 'components/UserImage'
import FlexBetween from 'components/FlexBetween'
import WidgetWrapper from 'components/WidgetWrapper'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage, messages } from 'components/LanguageContext';
import WalletConnectComponent from '../../WalletConnectComponent'
import VirusUser from 'components/VirusUser'

const UserWidget = ({ userId, picturePath }) => {
    const [editing, setEditing] = useState(false)
    const [profile, setProfile] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [user, setUser] = useState(null)
    const {currentLanguage} = useLanguage();
    const { palette } = useTheme()
    const navigate = useNavigate()
    const token = useSelector((state) => state.token)
    const login_id = useSelector((state) => state.user._id)
    const dark = palette.neutral.dark
    const medium = palette.neutral.medium
    const main = palette.neutral.main

    const getUser = async () => {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/users/${userId}`, {
            method: 'GET',
            headers: { 
                Authorization: `Bearer ${token}`,
                'login_id': login_id
            },
        })
        const data = await response.json()
        setUser(data)
        setProfile(data.description)
        setInputValue(data.description)
    }

    const handleEditClick = () => {
        setEditing(!editing) // Toggle the editing state
        // Add any additional logic you need here
    }

    const handleCancelClick = () => {
        setEditing(false) // Exit editing mode
        setInputValue(profile)
    }

    const handleSaveClick = async () => {
        setEditing(false) // Exit editing mode
        setProfile(inputValue)
        const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/users/description`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    description: inputValue,
                }),
            }
        )
        const update = await response.json()
    }

    const handleInputChange = (e) => {
        setInputValue(e.target.value) // Update input value
    }

    useEffect(() => {
        getUser()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (!user) {
        return null
    }
    // {"picturePath":"public/assets/00009-4284122733.png","_id":"1"}
    const {
        _id,
        user_name,
        // picturePath,
        holding,
        subscriber,
        description,
        postCount,
        totalLiked,
        maxLike,
        isFriend,
        netWorth,
    } = user

    return (
        <WidgetWrapper>
            {/* FIRST ROW */}
            <VirusUser
                friend_id={userId}
                name={user_name}
                subscriber={subscriber}
                user_picture_path={picturePath}
                is_friend={isFriend}
                is_main={true}
            />

            {login_id == userId && (
                <WalletConnectComponent holding={holding}></WalletConnectComponent>
            )}

            <Divider sx={{ marginTop: '1rem' }} />

            {/* SECOND ROW */}
            <Box p="1rem 0">
                <Typography
                    fontSize="1rem"
                    color={main}
                    fontWeight="500"
                    mb="1rem"
                >
                    <FlexBetween gap="1rem">
                        {messages[currentLanguage]?.social_profiles}
                        {login_id == userId && (
                            <EditOutlined
                                sx={{ color: main }}
                                onClick={handleEditClick}
                            />
                        )}
                    </FlexBetween>
                </Typography>
                {editing ? (
                    // Editing mode components
                    <div>
                        <textarea
                            style={{
                                width: '80%',
                                padding: '0.5rem',
                                marginBottom: '1rem',
                                border: 'none',
                                outline: 'none',
                                resize: 'none',
                                fontSize: '14px',
                                whiteSpace: 'pre-wrap',
                            }}
                            placeholder="Edit your social profile"
                            value={inputValue}
                            onChange={handleInputChange}
                        ></textarea>
                        <button
                            onClick={handleCancelClick}
                            style={{
                                marginRight: '0.5rem',
                                padding: '0.5rem 0.5rem',
                                backgroundColor: '#999999',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveClick}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#22bbbb',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s',
                            }}
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    // Display mode components
                    <div>
                        {/* Display social profiles here */}
                        <pre>{profile}</pre>
                    </div>
                )}
            </Box>

            <Divider />

            {/* THIRD ROW */}
            <Box p="1rem 0">
                <FlexBetween mb="0.5rem">
                    <Typography color={medium}>{messages[currentLanguage]?.number_of_posts}</Typography>
                    <Typography color={main} fontWeight="500">
                        {postCount}
                    </Typography>
                </FlexBetween>
                <FlexBetween mb="0.5rem">
                    <Typography color={medium}>{messages[currentLanguage]?.likes_received}</Typography>
                    <Typography color={main} fontWeight="500">
                        {totalLiked}
                    </Typography>
                </FlexBetween>
                <FlexBetween mb="0.5rem">
                    <Typography color={medium}>{messages[currentLanguage]?.top_post}</Typography>
                    <Typography color={main} fontWeight="500">
                        {maxLike} {messages[currentLanguage]?.likes}
                    </Typography>
                </FlexBetween>
                <FlexBetween mb="0.5rem">
                    <Typography color={medium}>{messages[currentLanguage]?.net_worth}</Typography>
                    <Typography color={main} fontWeight="500">
                        {netWorth} virus
                    </Typography>
                </FlexBetween>
            </Box>
        </WidgetWrapper>
    )
}

export default UserWidget
