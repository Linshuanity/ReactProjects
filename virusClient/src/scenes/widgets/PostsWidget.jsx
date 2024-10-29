import React, { useState, useEffect } from 'react';
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
    const [loading, setLoading] = useState(false); // Loading state to avoid multiple requests
    const [lastFetchedPage, setLastFetchedPage] = useState(0); // Keep track of the last fetched page
    const [page, setPage] = useState(1); // Change page to state variable

    const handleTabChange = (event, newValue) => {
        setPage(1); // Reset page to 1 when tab changes
        setPosts([]); // Reset posts
        setLastFetchedPage(0); // Reset lastFetchedPage
        setMode(newValue);
    }

    const apiEndpoint = 'http://localhost:3002'

    const getPosts = async () => {
        if (loading || page <= lastFetchedPage) {
            console.log('Already loading or same page requested:', page, lastFetchedPage);
            return;
        }
        
        setLoading(true);
    
        try {
            const currentRequestPage = page; // 保存當前的 page 值
            // 如果模式大於 3 是search模式，不需要分頁
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
                    page: currentRequestPage, // 傳送當前的頁數
                    limit: 10,
                }),
            });
    
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
    
            console.log('page:', currentRequestPage);
            console.log('data.page:', data.page);
            console.log('lastFetchedPage:', lastFetchedPage);
    
            if (data.page === currentRequestPage && lastFetchedPage === currentRequestPage - 1) {
                setPosts((prevPosts) => {
                    // 建立一組包含所有已存在 pid 的 Set
                    const existingPostIds = new Set(prevPosts.map(post => post.pid));
    
                    // 篩選出沒有重複 pid 的新 posts
                    const uniqueNewPosts = data.posts.filter(post => !existingPostIds.has(post.pid));
    
                    // 合併新 posts 並返回更新後的 posts
                    return [...prevPosts, ...uniqueNewPosts];
                });
    
                setLastFetchedPage(currentRequestPage);
    
                setPage((prevPage) => {
                    console.log('Incrementing page from:', prevPage);
                    return currentRequestPage + 1;
                });
            } else {
                console.log('Expect:' + currentRequestPage + ' Unexpected page response:' + data.page);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false); // 無論成功還是失敗都設置 loading 狀態為 false
        }
    };
    const handleScroll = () => {
        // 確保只有在快到達底部且目前沒有在載入新資料時才觸發
        if (
            window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100
            && !loading
        ) {
            getPosts();
        }
    };
    
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll); // 清除事件監聽器
    }, [page, lastFetchedPage, loading]); // 確保 handleScroll 監聽 page 和 loading 的變化
    
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
            await getPosts();
        };
        fetchData();
    }, [mode]); // 當模式變化時重新加載數據
    
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
            {posts.map((post, index) => (
                <div key={index} className="post">
                    {
                    //{index}:{post.pid}
                    }
                    {
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
                    }
                </div>
            ))}
            {loading && <p>Loading...</p>}
            {/* {posts.map((post) => (
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
            ))} */}
        </>
    )
}

export default PostsWidget
