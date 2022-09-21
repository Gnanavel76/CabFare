import React, { useEffect } from 'react'
import { Routes, Route } from "react-router-dom";
import { Home, CalculateFare, Loading } from "./components"
import { useJsApiLoader } from '@react-google-maps/api';
import { ToastContainer } from 'react-toastify';
import { createTheme, ThemeProvider, Typography } from '@mui/material';
import { useRoute } from './store';
import { gmap, ipInfo } from "./Env"
import 'react-toastify/dist/ReactToastify.css';

const libraries = ["places"]

const theme = createTheme({
  palette: {
    primary: {
      main: "#ffbd30"
    },
    secondary: {
      light: '#ead2ac',
      main: "#f7a654",
      dark: '#ff8901'
    },
    text: {
      secondary: '#454545'
    },
    card: {
      border: '#e6e6e6'
    }
  },
  typography: {
    fontFamily: 'Poppins, sans-serif'
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
        disableElevation: true
      },
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '1rem',
          textTransform: 'initial',
          lineHeight: '1.2',
          padding: '12px 30px',
        })
      },
      variants: [{
        props: { variant: 'contained' },
        style: ({ theme }) => ({
          '&:hover': {
            backgroundColor: theme.palette.primary.main
          },
          "&.Mui-disabled": {
            backgroundColor: theme.palette.primary.main,
            opacity: 0.5,
            color: "white"
          },
          "&.MuiLoadingButton-root": {
            width: '100%',
          },
          "&.MuiLoadingButton-root.MuiLoadingButton-loading": {
            opacity: 1,
            width: '3.5rem',
            height: '3.5rem',
            padding: 0,
            borderRadius: '100px',
            transition: 'width 150ms, border-radius 10ms 120ms'
          },
          "&.Mui-disabled>.MuiLoadingButton-loadingIndicator": {
            opacity: 1,
            color: "black",
            top: "50%",
            transform: 'translate(-50%,-50%)'
          }
        })
      }]
    },
    MuiTextField: {
      variants: [{
        props: { variant: 'outlined' },
        style: ({ theme }) => {
          return {
            "&.MuiTextField-root > .MuiInputBase-root.Mui-error": {
              borderColor: "#E92B2B"
            },
            "&.MuiTextField-root > .MuiFormHelperText-root.Mui-error": {
              fontSize: '14px',
              color: "#E92B2B",
              marginLeft: 0
            },
            "& .MuiOutlinedInput-root": {
              backgroundColor: '#f8f8f8'
            },
            "& .MuiOutlinedInput-root > fieldset": {
              borderColor: "#E4E4E4",
            },
            "& .MuiOutlinedInput-root:hover": {
              "& > fieldset": {
                borderColor: "#E4E4E4"
              }
            },
            "& .MuiOutlinedInput-root.Mui-focused": {
              "& > fieldset": {
                borderColor: theme.palette.primary.main
              }
            }
          }
        }
      }]
    }
  }
});


const App = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: gmap,
    libraries
  })
  const setCountry = useRoute((state) => state.setCountry)

  useEffect(() => {
    const getCountry = async () => {
      try {
        const res = await fetch(`https://ipinfo.io/json?token=${ipInfo}`)
        const data = await res.json()
        setCountry(data.country)
      } catch (err) {
        setCountry('IN')
      }
    }
    getCountry()
  }, [])

  if (!isLoaded) {
    return <Loading />
  }

  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculate-fare" element={<CalculateFare />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme='dark'
      />
    </ThemeProvider>
  )
}

export default App