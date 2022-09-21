import create from 'zustand'

export const useRoute = create((set) => ({
    country: "IN",
    route: {
        origin: {
            "place_id": "",
            "description": "",
            "location": { "lat": null, "lng": 0 }
        },
        destination: {
            "place_id": "",
            "description": "",
            "location": { "lat": null, "lng": 0 }
        },
        direction: null,
        distance: null,
        duration: null
    },
    setCountry: (country) => set(() => ({ country })),
    setRoute: (route) => set(() => ({ route }))
}))