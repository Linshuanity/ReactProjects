import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Button, TextField, Typography, useTheme } from '@mui/material'
import { Formik } from 'formik'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'

const resetPasswordSchema = yup.object().shape({
    password: yup.string().required('required'),
    confirmPassword: yup
        .string()
        .required('required')
        .oneOf([yup.ref('password'), null], 'Passwords must match'),
})

const initialValuesResetPassword = {
    password: '',
    confirmPassword: '',
}

const ResetPassword = () => {
    const theme = useTheme()
    const { token } = useParams()
    const navigate = useNavigate()
    const [error, setError] = useState(null)

    const resetPassword = async (values, onSubmitProps) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_URL}/auth/reset-password/${token}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                }
            )
            const resetPassword = await response.json()
            onSubmitProps.resetForm()

            if (resetPassword.status === 'success') {
                alert('密碼重設成功,現在可以登入了。')
                navigate('/')
            } else {
                setError(resetPassword.msg)
            }
        } catch (error) {
            console.error(error)
            setError('發生了一些錯誤,請稍後再試。')
        }
    }

    const handleFormSubmit = async (values, onSubmitProps) => {
        await resetPassword(values, onSubmitProps)
    }

    return (
        <Box>
            <Box
                width="100%"
                backgroundColor={theme.palette.background.alt}
                p="1rem 6%"
                textAlign="center"
            >
                <Typography fontWeight="bold" fontSize="32px" color="primary">
                    GoVirus
                </Typography>
            </Box>

            <Box
                width={'50%'}
                p="2rem"
                m="2rem auto"
                borderRadius="1.5rem"
                backgroundColor={theme.palette.background.alt}
            >
                <Typography fontWeight="bold" fontSize="32px" color="primary">
                    Reset Password
                </Typography>
                <Formik
                    onSubmit={handleFormSubmit}
                    initialValues={initialValuesResetPassword}
                    validationSchema={resetPasswordSchema}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <Box
                                display="grid"
                                gap="30px"
                                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                                sx={{
                                    '& > div': { gridColumn: 'span 4' },
                                }}
                            >
                                <TextField
                                    label="Password"
                                    type="password"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.password}
                                    name="password"
                                    error={
                                        Boolean(touched.password) &&
                                        Boolean(errors.password)
                                    }
                                    helperText={
                                        touched.password && errors.password
                                    }
                                    sx={{ gridColumn: 'span 4' }}
                                />
                                <TextField
                                    label="Confirm Password"
                                    type="password"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.confirmPassword}
                                    name="confirmPassword"
                                    error={
                                        Boolean(touched.confirmPassword) &&
                                        Boolean(errors.confirmPassword)
                                    }
                                    helperText={
                                        touched.confirmPassword &&
                                        errors.confirmPassword
                                    }
                                    sx={{ gridColumn: 'span 4' }}
                                />
                            </Box>
                            <Box>
                                <Button
                                    fullWidth
                                    type="submit"
                                    sx={{
                                        m: '2rem 0',
                                        p: '1rem',
                                        backgroundColor:
                                            theme.palette.primary.main,
                                        color: theme.palette.background.alt,
                                        '&:hover': {
                                            color: theme.palette.primary.main,
                                        },
                                    }}
                                >
                                    Reset Password
                                </Button>
                            </Box>
                        </form>
                    )}
                </Formik>
                {error && (
                    <Typography color="error" variant="body1">
                        {error}
                    </Typography>
                )}
            </Box>
        </Box>
    )
}

export default ResetPassword
