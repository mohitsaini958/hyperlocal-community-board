import { getGeoRoom } from "../utils/getGeoRoom.js";
export const setupGeoSocket =
    (io, socket) => {

        socket.on(
            "join_area",
            ({
                lat,
                lng,
            }) => {

                const roomId =
                    getGeoRoom(
                        lat,
                        lng
                    );

                socket.join(
                    roomId
                );

                console.log(
                    `Socket ${socket.id} joined ${roomId}`
                );
            }
        );

        socket.on(
            "join_post",
            (
                postId
            ) => {

                const roomId =
                    `post_${postId}`;

                socket.join(
                    roomId
                );

                console.log(
                    `Socket ${socket.id} joined ${roomId}`
                );
            }
        );

        socket.on(
    "join_user",
    (userId) => {

        socket.join(
            `user_${userId}`
        );

        console.log(
            `${socket.id} joined user_${userId}`
        );
    }
);

        socket.on(
            "disconnect",
            () => {

                console.log(
                    `Socket disconnected ${socket.id}`
                );
            }
        );
    };

export default setupGeoSocket;