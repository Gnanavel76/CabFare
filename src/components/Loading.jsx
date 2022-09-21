import React from 'react'
import loading from "../assets/loading.jpg"
const Loading = () => {
    return (
        <div className="w-full h-screen grid place-items-center content-center overflow-hidden">
            <img src={loading} alt="Loading" className='w-40' />
            <h4 className="mt-3 text-xl font-medium">Loading...</h4>
        </div>
    )
}

export default Loading