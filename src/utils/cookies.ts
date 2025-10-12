import { CookieOptions, Request, Response } from "express";

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
};

export const cookies = {
    getOptions: (): CookieOptions => cookieOptions,
    get: (request: Request, name: string): string => request.cookies[name],
    set: (response: Response, name: string, value: string, options: Partial<CookieOptions> = {}): void => {
        response.cookie(name, value, { ...cookies.getOptions(), ...options });
    },
    clear: (response: Response, name: string, options: Partial<CookieOptions> = {}): void => {
        response.clearCookie(name, { ...cookies.getOptions(), ...options })
    },
};
