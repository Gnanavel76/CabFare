import { getDetails, getLatLng } from "use-places-autocomplete";
const gmap = import.meta.env.VITE_GOOGLE_MAP
export const getCurrentLocation = (prevSelection) => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude
                if (prevSelection?.location?.lat !== lat && prevSelection?.location?.lng !== lng) {
                    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${gmap}`)
                    const data = await res.json()
                    if (data.status === "OK") {
                        const { formatted_address, place_id } = data.results[0];
                        resolve({ status: "OK", data: { place_id, description: formatted_address, location: { lat, lng } } })
                    }
                    reject({ status: "ERROR", error: "Could not able to fetch current location" })
                }
                reject({ status: "CURR_LOC_NOT_CHANGED" })
            }, (error) => {
                const errors = {
                    1: 'Permission denied',
                    2: 'Position unavailable',
                    3: 'Request timeout'
                };
                reject({ status: "ERROR", error: errors[error.code] })
            });
        } else {
            reject({ status: "ERROR", error: "This feature is not supported in your browser" })
        }
    })
}

export const calculateRoute = async (location) => {
    try {
        const { origin, destination, pickupTime } = location

        const [originRes, destErr] = await Promise.all([
            getDetails({ placeId: origin.place_id, fields: ["geometry"] }),
            getDetails({ placeId: destination.place_id, fields: ["geometry"] })
        ])

        const org = { place_id: origin.place_id, description: origin.description, location: getLatLng(originRes) }
        const des = { place_id: destination.place_id, description: destination.description, location: getLatLng(destErr) }
        const directionService = new google.maps.DirectionsService()
        const results = await directionService.route({
            origin: org.location,
            destination: des.location,
            travelMode: google.maps.TravelMode.DRIVING
        })
        return { status: "OK", data: { origin: org, destination: des, pickupTime, direction: results, distance: results.routes[0].legs[0].distance, duration: results.routes[0].legs[0].duration } }
    } catch (error) {
        console.log(error);
        return { status: "ERROR", error: "Could not able to calculate your fare" }
    }
}

export const validateForm = (location) => {
    const { origin, destination, pickupTime } = location
    const hour = parseInt(pickupTime.format("h"))
    if (origin?.description && destination?.description && origin?.description !== destination?.description && (hour >= 1 && hour <= 12)) return { isValid: true, errors: { originErr: '', destErr: "" } }
    const errors = {}
    if (!origin?.description) {
        errors.originErr = "Pickup location is requried"
    } else {
        errors.originErr = ""
    }
    if (!destination?.description) {
        errors.destErr = "Destination is requried"
    } else if (origin?.description === destination?.description) {
        errors.destErr = "Pickup & Destination should not be same"
    } else {
        errors.destErr = ""
    }
    if (hour < 1 || hour > 12) {
        errors.pickupTime = "Invalid Time"
    } else {
        errors.pickupTime = ""
    }
    return { isValid: false, errors }
}