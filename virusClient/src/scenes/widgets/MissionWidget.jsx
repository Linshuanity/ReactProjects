import { Box, Typography, LinearProgress, useTheme, Button, IconButton } from '@mui/material'
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
                <Typography color={dark} variant="h4" fontWeight="500">
                    Achievement
                </Typography>
            </FlexBetween>

            {listItems.slice(0, displayCount).map((item, index) => (
                <div key={item.ach_code} style={{ margin: '16px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                        <Typography variant="h5" fontWeight="500">
                            {item.name} : {item.value}
                        </Typography>
                        <Typography variant="h6" fontWeight="500">
                            <CoronavirusIcon color="blue"/>
                            {item.reward}
                        </Typography>
                    </div>
                    <div>
                        <div style={{ width: '100%', marginTop: '8px' }}>
                            <LinearProgress variant="determinate" value={100*(item.value - item.required)/(item.next - item.required)} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                            <Typography variant="h6" fontWeight="500">
                                Level {item.level} ({Math.floor(100*(item.value - item.required)/(item.next - item.required))}%)
                            </Typography>
                        </div>
                    </div>
                </div>
            ))}

            {listItems.length !== displayCount && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <IconButton onClick={() => setDisplayCount(listItems.length)}>
                        <ExpandMore />
                    </IconButton>
                </div>
            )}

            {listItems.length > 3 && listItems.length === displayCount && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <IconButton onClick={() => setDisplayCount(3)}>
                        <ExpandLess />
                    </IconButton>
                </div>
            )}

        </WidgetWrapper>
    )
}

export default MissionWidget
