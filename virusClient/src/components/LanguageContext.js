// LanguageContext.js
import React, { createContext, useState } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState('en'); // Default language

    const setLanguage = (language) => {
        setCurrentLanguage(language);
        localStorage.setItem('language', language); // Persist the language choice
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const messages = {
    en: {
        following: "Following",
        achievement: "Achievement",
        number_of_posts: "Number of posts",
        likes_received: "Likes received",
        top_post: "Top post",
        net_worth: "Net worth",
        likes: "likes",
        all: "All",
        unread: "Unread",
        read_all: "Read All",
        buy: "Buy",
        bid: "Bid",
        sell: "Sell",
        ask: "Ask",
        tip: "Tip",
        liked_your_post: "liked your post!",
        news: "News",
        my_post: "My Post",
        collection: "Collection",
        my_order: "My Order",
        search: "Search",
        social_profiles: "Social Profiles",
        install: "Install",
        cost: "Cost",
        image: "Image",
        add_image_here: "Add image here",
        days: "days",
        hrs: "hrs",
        mins: "mins",
        left: "left",
        ago: "ago",
        expired: "Expired",
        post: "Post",
        send: "Send",
        add_some_description: "Add some description...",
        loading: "Loading...",
        bottom_of_list: "Bottom of list",
        leave_a_comment: "Leave a comment...",
        log_in: "Log In",
        log_out: "Log Out",
        are_you_sure_you_want_to: "Are you sure you want to",
        are_you_sure_you_want_to_place: "Are you sure you want to place",
        are_you_sure_you_want_to_post: "Are you sure you want to post",
        buy_at: "buy at",
        sell_at: "sell at"
    },
    zh: {
        following: "追蹤",
        achievement: "成就",
        number_of_posts: "貼文數",
        likes_received: "獲得讚數",
        top_post: "最高讚數",
        net_worth: "貼文淨值",
        likes: "讚",
        all: "全部",
        unread: "未讀",
        read_all: "標為已讀",
        buy: "購買",
        bid: "出價",
        sell: "賣出",
        ask: "出價",
        tip: "充值",
        liked_your_post: "對你的貼文按讚",
        news: "熱門",
        my_post: "我的文章",
        collection: "收藏品",
        my_order: "未成交",
        search: "搜尋",
        social_profiles: "個人資料",
        install: "安裝",
        cost: "價格",
        image: "圖片",
        add_image_here: "上傳圖片",
        days: "日",
        hrs: "時",
        mins: "分",
        left: "後失效",
        ago: "前失效",
        expired: "已於",
        post: "貼文",
        send: "送出",
        add_some_description: "新增敘述...",
        loading: "讀取中...",
        bottom_of_list: "無更多結果",
        leave_a_comment: "留下評論...",
        log_in: "登入",
        log_out: "登出",
        are_you_sure_you_want_to: "你確定要",
        are_you_sure_you_want_to_place: "你確定要出價",
        are_you_sure_you_want_to_post: "你確定要貼文",
        buy_at: "購入價格",
        sell_at: "賣出價格"
    },
    // Add more languages here as needed
};

