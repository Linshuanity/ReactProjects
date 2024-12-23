import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import HomePage from 'scenes/homePage'
import LoginPage from 'scenes/loginPage'
import PostPage from 'scenes/postPage'
import ProfilePage from 'scenes/profilePage'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import { themeSettings } from './theme'
import { MessageProvider, useMessage } from 'components/MessageContext'
import ResetPassword from 'scenes/loginPage/ResetPassword'

const Message = () => {
    const { message, isVisible } = useMessage()

    if (!isVisible) return null

    return <div className="message-box fade-in">{message}</div>
}

function App() {
    const mode = useSelector((state) => state.mode)
    const theme = useMemo(() => createTheme(themeSettings(mode)), [mode])
    const isAuth = Boolean(useSelector((state) => state.token))
    return (
        <div className="app">
            <MessageProvider>
                <Message />
                <BrowserRouter>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <Routes>
                            <Route path="/" element={<LoginPage />} />
                            {/* <Route path="/home" element={isAuth ? <HomePage /> : <Navigate to="/" />} />
                            <Route path="/post/:postId" element={isAuth ? <PostPage /> : <Navigate to="/" />} /> */}
                            {/* Allow public browsing */}
                            <Route path="/home" element={<HomePage />} />
                            <Route path="/post/:postId" element={<PostPage />} />
                            <Route path="/profile/:userId" element={isAuth ? (<ProfilePage />) : (<Navigate to="/" />)} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />
                        </Routes>
                    </ThemeProvider>
                </BrowserRouter>
            </MessageProvider>
        </div>
    )
}

export default App
