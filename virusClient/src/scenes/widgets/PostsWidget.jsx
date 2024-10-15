import { useState } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Tab, Tabs, Typography, IconButton, Button, useTheme } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PostWidget from './PostWidget'

const PostsWidget = ({ userId, isProfile = false }) => {
    const { palette } = useTheme()
    const [mode, setMode] = useState(0)
    const dispatch = useDispatch()
    const [posts, setPosts] = useState([])
    const [keyword, setKeyword] = useState('')
    const token = useSelector((state) => state.token)
    const loggedInUserId = useSelector((state) => state.user._id)

    const handleTabChange = (event, newValue) => {
        setMode(newValue)
    }
    // const apiEndpoint = process.env.REACT_APP_API_ENDPOINT; // 使用環境變量
    const apiEndpoint = 'http://localhost:3002'

    const getPosts = async () => {
        try {
            if (mode > 3) {
                return;
            }
            const response = await fetch(`${apiEndpoint}/posts/all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    as_user: userId,
                    login_user: loggedInUserId,
                    filter_mode: mode,
                }),
            })
            if (!response.ok) throw new Error('Network response was not ok')
            const data = await response.json()
            setPosts(data)
        } catch (error) {
            console.error('Error fetching posts:', error)
        }
    }

    const getUserPosts = async () => {
        try {
            const response = await fetch(
                `${apiEndpoint}/posts/${userId}/posts`,
                {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            if (!response.ok) throw new Error('Network response was not ok')
            const data = await response.json()
            setPosts(data)
        } catch (error) {
            console.error('Error fetching user posts:', error)
            // 可以添加更多的錯誤處理邏輯
        }
    }

    const handleSearch = async () => {
        try {
            const response = await fetch(`${apiEndpoint}/posts/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    login_user: loggedInUserId,
                    keyword: keyword,
                }),
            })
            if (!response.ok) throw new Error('Network response was not ok')
            const data = await response.json()
            setPosts(data)
        } catch (error) {
            console.error('Error fetching posts:', error)
        }
    }

    const handleChange = (e) => {
        setKeyword(e.target.value)
    }

    useEffect(() => {
        const fetchData = async () => {
            await getPosts()
        }

        fetchData()
    }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <div style={{ marginTop: '10px' }}>
                <Tabs value={mode} onChange={handleTabChange}>
                    {userId == loggedInUserId && <Tab label="News" />}
                    <Tab label="My post" />
                    <Tab label="My collection" />
                    {userId == loggedInUserId && <Tab label="My order" />}
                    <Tab label="Search" />
                </Tabs>
                {mode === 4 && (
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                        <input
                            value={keyword}
                            onChange={handleChange}
                            type="text"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                outline: 'none',
                                resize: 'none',
                                backgroundColor: '#fff', // Ensure visibility with a solid background
                                color: 'grey',
                            }}
                            placeholder="Search your query..."
                        />
                        <IconButton onClick={handleSearch} style={{ marginLeft: '8px' }}>
                            <SearchIcon />
                        </IconButton>
                    </div>
                )}
            </div>
            {posts.map((post) => (
                <PostWidget
                    key={post.pid}
                    post_id={post.pid}
                    owner_id={post.owner_uid}
                    owner_name={post.owner_name}
                    owner_profile={post.owner_profile}
                    author_id={post.author_uid}
                    author_name={post.author_name}
                    author_profile={post.author_profile}
                    level={post.level}
                    description={post.title}
                    location="Taipei" // 需要根據實際數據進行動態設置
                    create_date={post.create_date}
                    expire_date={post.expire_date}
                    picturePath={post.image_path}
                    bid_user_id={post.bid_user_id}
                    bid_price={post.bid_price}
                    ask_price={post.ask_price}
                    is_liked={post.is_liked}
                    likes={post.likes}
                    my_bid={post.my_bid}
                    comments={post.comments}
                />
            ))}
        </>
    )
}

export default PostsWidget
