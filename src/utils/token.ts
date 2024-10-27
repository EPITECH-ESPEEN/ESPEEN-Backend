/*
    Authors:
    >> Nathan TIROLF - { nathan.tirolf@epitech.eu }

    („• ֊ •„)❤  <  Have a good day !
    --U-----U------------------------
*/
import { Request } from "express";

export function getFormattedToken(req: Request) {
    const token = req.headers.authorization;
    if (!token) return null;
    const tokenTable = token.split(" ");
    if (tokenTable.length < 2) return null;
    return tokenTable[1];
}
