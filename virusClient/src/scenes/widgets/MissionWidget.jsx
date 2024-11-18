import { Box, Typography, LinearProgress, useTheme, Button, IconButton, useMediaQuery } from '@mui/material'
import CoronavirusIcon from '@mui/icons-material/Coronavirus'
import FlexBetween from 'components/FlexBetween'
import WidgetWrapper from 'components/WidgetWrapper'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const MissionWidget = () => {
    const { palette } = useTheme()
    const dark = palette.neutral.dark
    const main = palette.neutral.main
    const medium = palette.neutral.medium

    const loggedInUserId = useSelector((state) => state.user._id)
    const [displayCount, setDisplayCount] = useState(3); // Number of items to display initially
    const [listItems, setListItems] = useState([]);
    const apiEndpoint = process.env.REACT_APP_SERVER_URL
    const isNonMobileScreens = useMediaQuery('(max-width:1000px)');

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
            console.error('Error fetching posts:', error)
        }
    }

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
                    Achievement
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
                            Lv {item.level} ({Math.floor(100 * (item.value - item.required) / (item.next - item.required))}%)
                        </Typography>
                        <Typography
                            variant="h6"
                            fontWeight="500"
                            sx={{
                                fontSize: isNonMobileScreens ? 'inherit' : '0.875rem' // Adjust font size for mobile
                            }}
                        >
                            <CoronavirusIcon sx={{ color: 'blue', fontSize: isNonMobileScreens ? 'inherit' : '1.25rem' }} />
                            {item.reward}
                        </Typography>
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
