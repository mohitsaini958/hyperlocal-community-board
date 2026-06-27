import { useEffect } from "react";

import socket from "../socket";

const useSocket = (
    userId,
    lat,
    lng
) => {

    useEffect(() => {

        if (
            !userId ||
            lat == null ||
            lng == null
        ) {
            return;
        }

        if (
            !socket.connected
        ) {
            socket.connect();
        }

        // Personal notification room

        socket.emit(
            "join_user",
            userId
        );

        // Geo room

        socket.emit(
            "join_area",
            {
                lat,
                lng,
            }
        );

        return () => {

            socket.disconnect();

        };

    }, [
        userId,
        lat,
        lng,
    ]);

    return socket;
};

export default useSocket;