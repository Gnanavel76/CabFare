import React, { useEffect, useState } from 'react'
import { MdLocationOn, MdOutlineArrowBack } from "react-icons/md";
import cabMini from "../../assets/cab_mini.png"
import cabSedan from "../../assets/cab_sedan.png"
import cabPlay from "../../assets/cab_play.png"
import cabSUV from "../../assets/cab_suv.png"
import { useRoute } from '../../store';
import shallow from 'zustand/shallow'
import { GoogleMap, DirectionsRenderer, OverlayView } from '@react-google-maps/api';
import { MdOutlineMyLocation } from "react-icons/md";
import { getAllInfoByISO } from 'iso-country-currency'
import locationPin from "../../assets/location.png"
import { getCurrentLocation, calculateRoute, validateForm } from '../../util';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import LoadingButton from '@mui/lab/LoadingButton';
import { AiFillClockCircle } from "react-icons/ai";
import usePlacesAutocomplete from "use-places-autocomplete";

const center = { lat: 19.03944929999999, lng: 72.8515476 }

const cabs = [
    {
        id: "Mini",
        title: "Mini",
        image: cabMini,
        description: "Affordable, compact rides",
        multiplier: 1
    },
    {
        id: "Prime Sedan",
        title: "Prime Sedan",
        image: cabSedan,
        description: "Comfortable sedans, top-quality drivers",
        multiplier: 1.25
    },
    {
        id: "Prime Play",
        title: "Prime Play",
        image: cabPlay,
        description: "Sedans with movies, music & more",
        multiplier: 1.4
    },
    {
        id: "Prime SUV",
        title: "Prime SUV",
        image: cabSUV,
        description: "Affordable, SUV rides",
        multiplier: 1.7
    }
]

const locale = navigator.language || 'en-US'

const exampleMapStyles = [
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#e6e9ec"
            }
        ]
    },
    {
        "featureType": "landscape.natural.landcover",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#e6e9ec"
            }
        ]
    },
    {
        "featureType": "landscape.natural.terrain",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#a6b5db"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#a6b5cb"
            }
        ]
    }
];



const CalculateFare = () => {
    const navigate = useNavigate()
    const { route, country, setRoute } = useRoute((state) => ({
        country: state.country,
        route: state.route,
        setRoute: state.setRoute
    }),
        shallow
    )
    const { origin, destination, pickupTime, direction, distance, duration } = route
    const [location, setLocation] = useState({ origin, destination, pickupTime: pickupTime })
    const [errors, setErrors] = useState({ originErr: "", destErr: "", pickupTime: "" })
    const [calculating, setCalculating] = useState(false)
    const [currency, setCurrency] = useState("INR")

    const {
        setValue,
        suggestions: { loading, status, data },
        clearSuggestions
    } = usePlacesAutocomplete({
        requestOptions: {
            componentRestrictions: { country }
        },
        debounce: 1000,
    });

    const modifySearch = async () => {
        setCalculating(true)
        const { isValid, errors } = validateForm(location)
        if (!isValid) {
            setErrors(errors)
            setCalculating(false)
            return
        }
        setErrors({ originErr: "", destErr: "", pickupTime: "" })
        if (origin?.description !== location.origin?.description || destination?.description !== location.destination?.description) {
            const { status, error, data } = await calculateRoute(location)
            if (status === "ERROR") {
                toast.error(error)
                return
            }
            setRoute(data)
        }
        setCalculating(false)
    }

    const calculateFare = (multiplier) => {
        let amount = (25 + ((distance.value * 0.001) * 16)) * multiplier
        const hour = parseInt(location.pickupTime.format("H"))
        if (hour >= 20 || hour < 6) {
            amount += amount * 0.25;
        }
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency
        }).format(
            Math.round(amount)
        )
    }

    const calculateDropOff = (seconds) => {
        const now = new Date()
        const dropOff = new Date(now.setSeconds(now.getSeconds() + seconds))
        return dropOff.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    }

    const setCurrentLocation = async () => {
        try {
            const { status, data } = await getCurrentLocation(origin)
            if (status === "CURR_LOC_NOT_CHANGED") return
            setLocation(prev => ({ ...prev, origin: data }))
        } catch (error) {
            if (error.status !== "CURR_LOC_NOT_CHANGED") {
                toast.error(error.error)
            }
        }

    }

    const goBack = () => {
        navigate(-1)
    }

    useEffect(() => {
        const currency = getAllInfoByISO(country).currency
        setCurrency(currency)
    }, [])


    const handleInput = (key, value) => {
        setLocation(prev => ({ ...prev, [key]: value }))
        clearSuggestions()
    }

    if (!origin?.description && !destination?.description) {
        return <Navigate to="/" />
    }
    return (
        <div className='h-screen flex flex-col-reverse md:flex-row'>
            <div className="flex flex-col bg-white border-r w-full md:w-[380px] lg:w-[406px] 2xl:w-[540px] h-1/2 md:h-full">
                <div className="bg-white px-4 pt-5 hidden md:block" >
                    <div className='relative mb-6'>
                        <button onClick={goBack} className="absolute top-1/2 -translate-y-1/2 text-base sm:text-lg xl:text-2xl">
                            <MdOutlineArrowBack />
                        </button>
                        <h6 className="font text-center font-semibold text-base sm:text-lg xl:text-2xl">CabFare</h6>
                    </div>
                    <div className="pb-4 border-b">
                        <Autocomplete
                            freeSolo
                            loading={loading}
                            loadingText="Searching..."
                            onClose={clearSuggestions}
                            clearOnBlur={true}
                            options={data}
                            value={location.origin}
                            onChange={(event, value) => handleInput("origin", value)}
                            onInputChange={(event, value) => setValue(value)}
                            getOptionLabel={(option) => option.description}
                            clearIcon={null}
                            popupIcon={null}
                            renderInput={(params) => (
                                <TextField

                                    error={errors.originErr !== ""}
                                    helperText={errors.originErr !== "" ? errors.originErr : ""}
                                    {...params}
                                    placeholder="Add a pickup location"
                                    sx={{ mb: 1.5, "& .MuiInputBase-root": { pr: "9px!important" }, "& .MuiInputBase-input": { px: "0!important", py: '6px!important' } }}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start" sx={{ color: "#9ca3af99", fontSize: "1.25rem", px: 1 }}>
                                                <MdLocationOn />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment onClick={setCurrentLocation} position="start" sx={{ fontSize: "1.25rem", px: 1, mr: 0, cursor: "pointer" }}>
                                                <MdOutlineMyLocation />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />
                        <Autocomplete
                            freeSolo
                            loading={loading}
                            loadingText="Searching..."
                            onClose={clearSuggestions}
                            clearOnBlur={true}
                            options={data}
                            value={location.destination}
                            onChange={(event, value) => handleInput("destination", value)}
                            onInputChange={(event, value) => setValue(value)}
                            getOptionLabel={(option) => option.description}
                            clearIcon={null}
                            popupIcon={null}
                            renderInput={(params) => (
                                <TextField
                                    error={errors.destErr !== ""}
                                    helperText={errors.destErr !== "" ? errors.destErr : ""}
                                    {...params}
                                    placeholder="Enter your destination"
                                    sx={{ mb: 1.5, "& .MuiInputBase-input": { px: "0!important" } }}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start" sx={{ color: "#9ca3af99", fontSize: "1.25rem", px: 1 }}>
                                                <MdLocationOn />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <MobileTimePicker
                                value={location.pickupTime}
                                onChange={time => setLocation(prev => ({ ...prev, pickupTime: time }))}
                                renderInput={(params) =>
                                    <TextField
                                        error={errors.pickupTime !== ""}
                                        helperText={errors.pickupTime !== "" ? errors.pickupTime : ""}
                                        fullWidth
                                        {...params}
                                        sx={{ mb: 2, "& .MuiInputBase-root": { pl: "9px" } }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ color: "#9ca3af99", fontSize: "1.25rem", px: 1 }}>
                                                    <AiFillClockCircle />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                }
                            />
                        </LocalizationProvider>
                        {/* <button onClick={calculate} className={`transition-all block mx-auto h-14 bg-red-300 bg-primary text-base sm:text-xl font-medium ${calculating ? "w-14 grid place-items-center rounded-full" : "w-auto rounded-lg px-8 py-4"}`}>
                            {calculating
                                ? <ImSpinner8 className='animate-spin text-lg' />
                                : "Calculate"}
                        </button> */}
                        <LoadingButton loading={calculating} onClick={modifySearch} sx={{ mb: 1, borderRadius: 2, display: 'block', mx: "auto", py: 2, fontSize: { xs: '1rem', xl: "1.2rem" } }} variant="contained">Modify Search</LoadingButton>
                    </div>
                </div >
                {
                    calculating
                        ?
                        <div className='px-3 sm:px-6 pt-4 pb-8 overflow-auto'>
                            <div className="animate-pulse mb-6 h-7 rounded-md bg-gray-200" ></div >
                            <div className="animate-pulse mb-8 h-7 rounded-md bg-gray-200"></div>
                            <h6 className="text-xl text-gray-500 mb-6 font-medium border-b-2 pb-2">Ride Fare</h6>
                            <div className='flex flex-col gap-y-3'>
                                {new Array(3).fill(0).map((cab, index) => (
                                    <div key={index} className='px-3 py-4  flex gap-x-8 items-center border-2 border-inputBorder rounded-lg'>
                                        <div className="w-20 bg-gray-200 h-20 rounded-full"></div>
                                        <div className='flex-1'>
                                            <div className="animate-pulse mb-2 h-6 rounded-md bg-gray-200"></div>
                                            <div className="animate-pulse mb-2 h-4 rounded-md bg-gray-200 w-6/12"></div>
                                            <div className="animate-pulse h-4 rounded-md bg-gray-200 w-4/12"></div>
                                        </div>
                                        <div className="animate-pulse h-5 rounded-md bg-gray-200"></div>
                                    </div>
                                ))}
                            </div>
                        </div >
                        :
                        <div className='px-4 pt-5 pb-8 overflow-auto '>
                            <h6 className="text-sm sm:text-base 2xl:text-lg mb-3 md:mb-4 font-medium">Distance: {distance.text}</h6>
                            <h6 className="text-sm sm:text-base 2xl:text-lg mb-6 md:mb-8 font-medium">Duration: {duration.text}</h6>
                            <h6 className="text-sm sm:text-base 2xl:text-lg text-gray-500 mb-5 font-medium border-b-2 pb-2">Ride Fare</h6>
                            <div className='flex flex-col gap-y-3'>
                                {cabs.map(cab => (
                                    <div key={cab.id} className='px-2 sm:px-3 py-4 flex gap-x-4 md:gap-x-5 items-center border-2 border-inputBorder rounded-lg w-full'>
                                        <img className='w-16 2xl:w-20' src={cab.image} alt="" />
                                        <div className='grow min-w-0'>
                                            <div className='flex justify-between mb-1'>
                                                <h6 className="text-base 2xl:text-lg font-semibold tracking-wide truncate">{cab.title}</h6>
                                                <h6 className="text-base 2xl:text-lg font-medium tracking-wide mr-1.5">
                                                    {calculateFare(cab.multiplier)}
                                                </h6>
                                            </div>
                                            <h6 className="text-xs sm:text-base 2xl:text-lg mb-1 text-gray-500 truncate">{cab.description}</h6>
                                            <h6 className="text-xs sm:text-base 2xl:text-lg text-gray-500 ">{calculateDropOff(duration.value)} dropoff</h6>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                }

            </div >
            <div className="relative bg-white w-full md:w-[calc(100%-380px)] lg:w-[calc(100%-406px)] 2xl:w-[calc(100%-540px)] h-1/2 md:h-full">
                <button onClick={goBack} className="md:hidden absolute left-5 top-8 w-11 h-11 shadow-md grid place-items-center text-lg bg-white rounded-full z-50">
                    <MdOutlineArrowBack className='text-xl' />
                </button>
                <GoogleMap
                    mapContainerClassName='w-full h-full'
                    center={center}
                    zoom={14}
                    options={{
                        zoomControl: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        styles: exampleMapStyles,
                        scrollwheel: false,
                        disableDoubleClickZoom: true,
                    }}
                >
                    {direction && <DirectionsRenderer directions={direction} options={{
                        polylineOptions: { strokeColor: '#313641', strokeWeight: '4' },
                        markerOptions: { icon: { url: locationPin, scaledSize: { width: 40, height: 40 } } }
                    }} />}
                    <OverlayView
                        position={origin.location}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                        <h6 className="bg-white px-2 sm:px-4 py-1 sm:py-2.5 text-xs md:text-base 2xl:text-xl shadow-lg font-medium -translate-y-11 translate-x-6">From {origin.description.split(",")[0]}</h6>
                    </OverlayView>
                    <OverlayView
                        position={destination.location}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                        <h6 className="bg-white px-2 sm:px-4 py-1 sm:py-2.5 text-sm md:text-base 2xl:text-xl shadow-lg font-medium -translate-y-11 translate-x-6">To {destination.description.split(",")[0]}</h6>
                    </OverlayView>
                </GoogleMap>
            </div>
        </div >
    )
}

export default CalculateFare