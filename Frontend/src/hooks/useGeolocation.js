import { useState,useEffect,useCallback } from "react";
import api from "../api/axios.js"

const getNeighborhood = async(lat,lng)=>{
    try {
        const res=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } });
        const data=res.json();
        return (
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.village ||
            data.address?.town ||
            data.address?.city ||
            "Nearby"
        );
    } catch {
        return "Nearby";
    }
};

const useGeolocation=()=>{

  const [lat, setLat]                   = useState(null);
  const [lng, setLng]                   = useState(null);
  const [neighborhood, setNeighborhood] = useState("");
  const [error, setError]               = useState(null);
  const [loading, setLoading]           = useState(true);

const updateLocation=useCallback(async(latitude,longitude)=>{
    try {
        
        const hood=await getNeighborhood(latitude,longitude);
        setNeighborhood(hood);

        await api.put("users/location",{
            latitude:latitude,
            longitude:longitude,
            neighborhood:hood,
        });
    } catch (error) {
        console.warn("Location update failled:",error.message); 
    }
},[]);

const fetchLocation=useCallback(()=>{
    if(!navigator.geolocation){
        setError("Geolocation is not supported by your browser.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(async(position)=>{
        const {latitude,longitude}=position.coords;
        setLat(latitude);
        setLng(longitude);
        setLoading(false);
        await updateLocation(latitude,longitude);
    },
    (err)=>{
        setLoading(false);
        switch(err.code){
            case err.PERMISSION_DENIED:
            setError("PERMISSION_DENIED");
            break;
            case err.POSITION_UNAVAILABLE:
            setError("POSITION_UNAVAILABLE");
            break;
            case err.TIMEOUT:
            setError("TIMEOUT");
            break;
            default:
            setError("UNKNOWN");    
        }
    },
    {
        enableHighAccuracy:true,
        timeout:10000,
        maximumAge:0,
    }
);
},[updateLocation]);

 useEffect(()=>{
    fetchLocation();
 },[fetchLocation]);

//  useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible") {
//         fetchLocation();
//       }
//     };
//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, [fetchLocation]);

  return { lat, lng, neighborhood, error, loading, refetch: fetchLocation };
};

export default useGeolocation;