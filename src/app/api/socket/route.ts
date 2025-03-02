import { Server as IOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import webpush from 'web-push';
import { Server as HTTPServer } from 'http';

webpush.setVapidDetails(
    'mailto:youremail@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

// 扩展 NextApiResponse 的类型定义
type NextApiResponseWithSocket = NextApiResponse & {
    socket: {
        server: HTTPServer & {
            io?: IOServer;
        };
    };
};

interface IPushSubscription extends PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}
export async function POST(req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (!res.socket.server.io) {
        console.log('*First use, starting socket.io');
        const io = new IOServer(res.socket.server, {
            path: '/api/socket',
        });

        res.socket.server.io = io;

        io.on('connection', (socket) => {
            console.log('A user connected');

            socket.on('subscribe', (subscription: IPushSubscription) => {
                socket.data.subscription = subscription;
            });

            socket.on('message', async (message: string) => {
                console.log('Received:', message);
                // 处理消息并发送推送通知
                if (socket.data.subscription) {
                    await webpush.sendNotification(
                        socket.data.subscription,
                        JSON.stringify({
                            title: 'WebSocket Notification',
                            body: message,
                            icon: '/icon.png',
                            url: '/'
                        })
                    );
                }
            });

            socket.on('disconnect', () => {
                console.log('A user disconnected');
            });
        });
    }
    res.end();

}


// export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
//     if (req.method === 'GET') {
//         if (!res.socket.server.io) {
//             console.log('*First use, starting socket.io');
//             const io = new IOServer(res.socket.server, {
//                 path: '/api/socket',
//             });

//             res.socket.server.io = io;

//             io.on('connection', (socket) => {
//                 console.log('A user connected');

//                 socket.on('subscribe', (subscription: IPushSubscription) => {
//                     socket.data.subscription = subscription;
//                 });

//                 socket.on('message', async (message: string) => {
//                     console.log('Received:', message);
//                     // 处理消息并发送推送通知
//                     if (socket.data.subscription) {
//                         await webpush.sendNotification(
//                             socket.data.subscription,
//                             JSON.stringify({
//                                 title: 'WebSocket Notification',
//                                 body: message,
//                                 icon: '/icon.png',
//                                 url: '/'
//                             })
//                         );
//                     }
//                 });

//                 socket.on('disconnect', () => {
//                     console.log('A user disconnected');
//                 });
//             });
//         }

//         res.end();
//     } else {
//         res.setHeader('Allow', ['GET']);
//         res.status(405).end(`Method ${req.method} Not Allowed`);
//     }
// }

export const config = {
    api: {
        bodyParser: false
    }
};
