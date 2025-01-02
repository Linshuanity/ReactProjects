import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Form from '../scenes/loginPage/Form';

const FloatLogin = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgcolor="rgba(0, 0, 0, 0.5)" // 半透明背景
            display="flex"
            justifyContent="center"
            alignItems="center"
            zIndex={1000} // 確保在其他內容之上
        >
            <Box
                bgcolor="white"
                p="2rem"
                borderRadius="0.5rem"
                width={{ xs: '90%', sm: '70%', md: '50%' }}
                position="relative"
            >
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h6" gutterBottom>
                Please sign in or register to continue
                </Typography>
                <Form /> {/* 使用現有的 Form 組件 */}
            </Box>
        </Box>
    );
};

export default FloatLogin;