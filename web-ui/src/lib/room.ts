import { prisma } from "./prisma";

export function random(length: number) {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

export async function createRoomId() {
    let roomId = '';
    let isUnique = false;

    // make sure a unique
    while (!isUnique) {
        roomId = `${random(3)}-${random(4)}-${random(3)}`;

        const exists = await prisma.room.findUnique({
            where: { roomId },
        });

        if (!exists) {
            isUnique = true;
        }
    }

    return roomId;
}