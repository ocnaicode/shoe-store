import { NextResponse } from "next/server";
import { getSettings, saveSettings, connectDB } from "@/lib/db";
import Settings from "@/models/Settings";

async function getSettingsFromDB() {
  try {
    const conn = await connectDB();
    if (conn) {
      let doc = await (Settings as any).findOne();
      if (doc) {
        // Merge with defaults to ensure all fields exist
        const defaults = getSettings();
        return {
          ...defaults,
          ...doc.toObject(),
          cloudinary: { ...defaults.cloudinary, ...(doc.cloudinary || {}) },
          siteSettings: { ...defaults.siteSettings, ...(doc.siteSettings || {}) },
          socialLogin: { ...defaults.socialLogin, ...(doc.socialLogin || {}) },
          whatsapp: { ...defaults.whatsapp, ...(doc.whatsapp || {}) },
          abandonedCart: { ...defaults.abandonedCart, ...(doc.abandonedCart || {}) },
          steadfast: { ...defaults.steadfast, ...(doc.steadfast || {}) },
          flashSale: { ...defaults.flashSale, ...(doc.flashSale || {}) },
          delivery: { ...defaults.delivery, ...(doc.delivery || {}) },
          payment: { ...defaults.payment, ...(doc.payment || {}) },
          siteName: doc.siteName || defaults.siteName,
          currency: doc.currency || defaults.currency,
        };
      }
    }
  } catch (e) {
    console.log("Settings DB fetch failed, using file fallback", e);
  }
  return getSettings();
}

async function saveSettingsToDB(settings: any) {
  try {
    const conn = await connectDB();
    if (conn) {
      let doc = await (Settings as any).findOne();
      if (doc) {
        Object.assign(doc, settings);
        await doc.save();
      } else {
        await (Settings as any).create(settings);
      }
      return true;
    }
  } catch (e) {
    console.log("Settings DB save failed", e);
  }
  try {
    saveSettings(settings);
  } catch (e: any) {
    if (e.code === "EROFS" || e.message?.includes("read-only")) {
      console.log("File system read-only, skipping file save (Vercel)");
    } else {
      throw e;
    }
  }
  return false;
}

export async function GET() {
  const settings = await getSettingsFromDB();
  const safe = {
    ...settings,
    cloudinary: {
      ...settings.cloudinary,
      apiSecret: settings.cloudinary.apiSecret ? "••••" + settings.cloudinary.apiSecret.slice(-4) : "",
    },
    steadfast: {
      ...settings.steadfast,
      apiKey: settings.steadfast.apiKey ? "••••" + settings.steadfast.apiKey.slice(-4) : "",
      secretKey: settings.steadfast.secretKey ? "••••" + settings.steadfast.secretKey.slice(-4) : "",
    },
    socialLogin: {
      ...settings.socialLogin,
      googleClientSecret: settings.socialLogin.googleClientSecret ? "••••" + settings.socialLogin.googleClientSecret.slice(-4) : "",
      facebookAppSecret: settings.socialLogin.facebookAppSecret ? "••••" + settings.socialLogin.facebookAppSecret.slice(-4) : "",
    },
  };
  return NextResponse.json(safe);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = await getSettingsFromDB();
    const updated: any = { ...current };

    if (body.socialLogin) {
      updated.socialLogin = {
        ...current.socialLogin,
        ...body.socialLogin,
        googleClientSecret: body.socialLogin.googleClientSecret?.includes("•") ? current.socialLogin.googleClientSecret : body.socialLogin.googleClientSecret ?? current.socialLogin.googleClientSecret,
        facebookAppSecret: body.socialLogin.facebookAppSecret?.includes("•") ? current.socialLogin.facebookAppSecret : body.socialLogin.facebookAppSecret ?? current.socialLogin.facebookAppSecret,
      };
    }
    if (body.whatsapp) updated.whatsapp = { ...current.whatsapp, ...body.whatsapp };
    if (body.abandonedCart) updated.abandonedCart = { ...current.abandonedCart, ...body.abandonedCart };
    if (body.steadfast) {
      updated.steadfast = {
        ...current.steadfast,
        ...body.steadfast,
        apiKey: body.steadfast.apiKey?.includes("•") ? current.steadfast.apiKey : body.steadfast.apiKey ?? current.steadfast.apiKey,
        secretKey: body.steadfast.secretKey?.includes("•") ? current.steadfast.secretKey : body.steadfast.secretKey ?? current.steadfast.secretKey,
      };
    }
    if (body.flashSale) updated.flashSale = { ...current.flashSale, ...body.flashSale };
    if (body.delivery) updated.delivery = { ...current.delivery, ...body.delivery };
    if (body.payment) updated.payment = { ...current.payment, ...body.payment };
    if (body.cloudinary) {
      updated.cloudinary = {
        ...current.cloudinary,
        ...body.cloudinary,
        apiSecret: body.cloudinary.apiSecret?.includes("•") ? current.cloudinary.apiSecret : body.cloudinary.apiSecret ?? current.cloudinary.apiSecret,
      };
    }
    if (body.siteSettings) {
      updated.siteSettings = {
        ...current.siteSettings,
        ...body.siteSettings,
        contact: { ...current.siteSettings.contact, ...(body.siteSettings.contact || {}) },
        social: { ...current.siteSettings.social, ...(body.siteSettings.social || {}) },
        footer: { ...current.siteSettings.footer, ...(body.siteSettings.footer || {}) },
        announcement: { ...current.siteSettings.announcement, ...(body.siteSettings.announcement || {}) },
        theme: { ...current.siteSettings.theme, ...(body.siteSettings.theme || {}) },
      };
    }
    if (body.siteName) updated.siteName = body.siteName;
    if (body.currency) updated.currency = body.currency;
    if (body.heroSlides || body.sections) {
      // For home settings passed via settings route (fallback)
      if (body.heroSlides) updated.heroSlides = body.heroSlides;
      if (body.sections) updated.sections = body.sections;
    }

    await saveSettingsToDB(updated);
    return NextResponse.json({ success: true, settings: updated });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
