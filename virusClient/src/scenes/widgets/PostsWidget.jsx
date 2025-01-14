import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux'
import { Tab, Tabs, Typography, IconButton, Button, useTheme } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PostWidget from './PostWidget'
import { LanguageContext, messages } from 'components/LanguageContext';

const PostsWidget = ({ userId, isProfile = false }) => {
    const [mode, setMode] = useState(0)
    const {currentLanguage} = useContext(LanguageContext);
    const [posts, setPosts] = useState([])
    const [keyword, setKeyword] = useState('')
    const token = useSelector((state) => state.token)
    const isAuth = Boolean(token); // 是否登入
    const loggedInUserId = useSelector((state) => state.user?._id); 
    const [loading, setLoading] = useState(0); // Loading state to avoid multiple requests
    const [lastFetchedPage, setLastFetchedPage] = useState(0); // Keep track of the last fetched page
    const [page, setPage] = useState(1); // Change page to state variable

    const apiEndpoint = process.env.REACT_APP_SERVER_URL

    const handleTabChange = (event, newValue) => {
        setPage(1); // Reset page to 1 when tab changes
        setPosts([]); // Reset posts
        setLastFetchedPage(0); // Reset lastFetchedPage
        setMode(newValue);
    }

    const getPosts = async () => {
        if (loading > 0 || page <= lastFetchedPage) {
            return;
        }

        setLoading(1);

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
                    login_user: isAuth ? loggedInUserId : 0,
                    filter_mode: mode,
                    page: currentRequestPage, // 傳送當前的頁數
                    limit: 10,
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data.page === currentRequestPage && lastFetchedPage === currentRequestPage - 1) {
                setPosts((prevPosts) => {
                    // 建立一組包含所有已存在 pid 的 Set
                    const existingPostIds = new Set(prevPosts.map(post => post.pid));

                    // 篩選出沒有重複 pid 的新 posts
                    const uniqueNewPosts = data.posts.filter(post => !existingPostIds.has(post.pid));

                    if (uniqueNewPosts.length === 0) {
                        setLoading(2);
                        return prevPosts; // No changes to posts
                    }

                    setLastFetchedPage(currentRequestPage);

                    setPage((prevPage) => {
                        return currentRequestPage + 1;
                    });
                    // 合併新 posts 並返回更新後的 posts
                    return [...prevPosts, ...uniqueNewPosts];
                });
            } else {
                console.log('Expect:' + currentRequestPage + ' Unexpected page response:' + data.page);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            if (loading !== 2) {
                setLoading(0);
            }
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
                    login_user: isAuth ? loggedInUserId : 0,
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
        setLoading(0);
        const fetchData = async () => {
            await getPosts();
        };
        fetchData();
    }, [mode]); // 當模式變化時重新加載數據

    // return ( <></>);
    return (
        <>
            <div style={{ marginTop: '10px' }}>
                {isAuth && (
                    <Tabs value={mode} onChange={handleTabChange}>
                        {userId == loggedInUserId && <Tab label={messages[currentLanguage]?.news} value={0} />}
                        <Tab label={messages[currentLanguage]?.my_post} value={1} />
                        <Tab label={messages[currentLanguage]?.collection} value={2} />
                        {userId == loggedInUserId && <Tab label={messages[currentLanguage]?.my_order} value={3} />}
                        <Tab label={messages[currentLanguage]?.search} value={4} />
                    </Tabs>
                )}
                {isAuth && mode === 4 && (
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
                    {/* {index}:{post.pid} */}
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
                </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p style={{ textAlign: 'center', fontSize: '1.2em', color: '#555' }}>
                    {loading === 1 ? messages[currentLanguage]?.loading : loading === 2 ? messages[currentLanguage]?.bottom_of_list : null}
                </p>
            </div>
        </>
    )
}

export default PostsWidget
