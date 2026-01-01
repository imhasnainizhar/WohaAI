import UAParser from "ua-parser-js";
import { ClientData } from "@packages/shared/common/auth/types";
import { Request } from "express";


/**
 * @description This is handler level util mainly to get client data from request headers.
 * But can be used everywhere as per needs.
 * @param req : Request
 * @returns ClientData
 */
export function getClientData(req: Request): ClientData {
    const ua = req.headers['user-agent'] || "";
    const parser = new (UAParser as any)(ua);
    const device = parser.getDevice();       // { model, type, vendor }
    const os = parser.getOS();               // { name, version }
    const browser = parser.getBrowser();     // { name, version }

    // If behind a proxy (like Nginx, Cloudflare)
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;

    return {
        userDeviceName: device.model || `${os.name} ${os.version}`,
        userDeviceType: device.type || "desktop",
        userDeviceID:
            device.deviceId ||
            `${device.deviceType ?? "Unknown"}-${crypto.randomUUID()}`,
        userDeviceBrowser: browser.name,
        userDeviceOS: `${os.name} ${os.version}`,
        userIPAddress: String(ip),
    };
}