import { Box, Typography, LinearProgress, useTheme, Button, IconButton, useMediaQuery } from '@mui/material'
import CoronavirusIcon from '@mui/icons-material/Coronavirus'
import FlexBetween from 'components/FlexBetween'
import WidgetWrapper from 'components/WidgetWrapper'
import { useEffect, useState, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { MessageProvider, useMessage } from 'components/MessageContext'
import { LanguageContext, messages } from 'components/LanguageContext';

const MissionWidget = () => {
    const { palette } = useTheme()
    const {currentLanguage} = useContext(LanguageContext)
    const dark = palette.neutral.dark
    const main = palette.neutral.main
    const medium = palette.neutral.medium

    const loggedInUserId = useSelector((state) => state.user._id)
    const [displayCount, setDisplayCount] = useState(3); // Number of items to display initially
    const [listItems, setListItems] = useState([]);
    const apiEndpoint = process.env.REACT_APP_SERVER_URL
    const isNonMobileScreens = useMediaQuery('(max-width:1000px)');
    const { showMessage } = useMessage()

    const getAchievement = async () => {
        try {
            const response = await fetch(`${apiEndpoint}/achievement/fetch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: loggedInUserId,
                }),
            })
            if (!response.ok) throw new Error('Network response was not ok')
            const data = await response.json()
            setListItems(data)
        } catch (error) {
            console.error('Error fetching achievement:', error)
        }
    }

    const handleClaim = async (achievementId) => {
        try {
            const response = await fetch(`${apiEndpoint}/achievement/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: loggedInUserId,
                    aId: achievementId
                }),
            })
            if (!response.ok) throw new Error('Network response was not ok')
            const data = await response.json()
            if (data.totalReward > 0) {
                showMessage(
                    'Level Up + ' + data.totalReward + ' virus',
                    3000,
                    'message-box-green'
                )
            }
        } catch (error) {
            console.error('Error updaating achievement:', error)
        }
    };

    useEffect(() => {
        getAchievement()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <WidgetWrapper>
            <FlexBetween>
                <Typography
                    color="dark"
                    variant="h4"
                    fontWeight="500"
                >
                    {messages[currentLanguage]?.achievement}
                </Typography>
            </FlexBetween>

            {listItems.slice(0, displayCount).map((item) => (
                <Box key={item.ach_code} sx={{ margin: '16px 0' }}>
                    <Box display="flex" justifyContent="space-between" sx={{ mt: '8px' }}>
                        <Typography
                            variant="h5"
                            fontWeight="500"
                            sx={{
                                fontSize: isNonMobileScreens ? 'inherit' : '1rem' // Adjust font size for mobile
                            }}
                        >
                            {item.name} : {item.value}
                        </Typography>
                    </Box>

                    <Box sx={{ width: '100%', mt: '8px' }}>
                        <LinearProgress
                            variant="determinate"
                            value={100 * (item.value - item.required) / (item.next - item.required)}
                        />
                    </Box>

                    <Box display="flex" justifyContent="space-between" sx={{ mt: '8px' }}>
                        <Typography
                            variant="h6"
                            fontWeight="500"
                            sx={{
                                fontSize: isNonMobileScreens ? 'inherit' : '0.875rem' // Adjust font size for mobile
                            }}
                        >
                            Lv {item.level} ({Math.floor(100 * Math.min(1, (item.value - item.required) / (item.next - item.required)))}%)
                        </Typography>
                        <Button
                            variant="text"
                            sx={{
                                fontSize: isNonMobileScreens ? 'inherit' : '0.875rem',
                                Width: '30px', // Optional: Set a minimum width
                                height: '24px', // Optional: Set a specific height for a smaller button
                                fontWeight: 300,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                textTransform: 'none', // Prevent uppercase transformation
                                backgroundColor: item.claimable_amount > 0 ? 'yellow' : 'grey.400', // Use theme colors
                                color: item.claimable_amount > 0 ? 'primary.main' : 'grey.600',
                                cursor: item.claimable_amount > 0 ? 'grab' : 'not-allowed', // Change cursor based on state
                                '&:hover': {
                                    backgroundColor: item.claimable_amount > 0 ? 'primary.dark' : 'grey.400',
                                },
                                padding: '0.3rem 0.5rem', // Add some padding for better appearance
                                borderRadius: '0.5rem', // Rounded corners
                                boxShadow: item.claimable_amount > 0 ? 3 : 0, // Slight shadow when active
                                transition: 'all 0.3s ease', // Smooth hover effect
                            }}
                            onClick={() => handleClaim(item.a_id)} // Add your button click handler
                            disabled={item.claimable_amount === 0} // Disable when claimable is false
                        >
                            <CoronavirusIcon sx={{ color: 'gray', fontSize: isNonMobileScreens ? 'inherit' : '1.25rem' }} />
                            <span>{item.claimable_amount > 0 ? item.claimable_amount : item.reward}</span>
                        </Button>
                    </Box>
                </Box>
            ))}

            {listItems.length !== displayCount && (
                <Box textAlign="center" sx={{ mt: '16px' }}>
                    <IconButton onClick={() => setDisplayCount(listItems.length)}>
                        <ExpandMore sx={{ fontSize: isNonMobileScreens ? 'inherit' : '1.25rem' }} />
                    </IconButton>
                </Box>
            )}

            {listItems.length > 3 && listItems.length === displayCount && (
                <Box textAlign="center" sx={{ mt: '16px' }}>
                    <IconButton onClick={() => setDisplayCount(3)}>
                        <ExpandLess sx={{ fontSize: isNonMobileScreens ? 'inherit' : '1.25rem' }} />
                    </IconButton>
                </Box>
            )}
        </WidgetWrapper>
    );
};

export default MissionWidget
