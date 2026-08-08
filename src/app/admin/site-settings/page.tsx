"use client";
import { useEffect, useState } from "react";

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings").then(r=>r.json()).then(d=> { setSettings(d.siteSettings); setLoading(false); });
  }, []);

  const updateField = (section: string, field: string, value: any) => {
    setSettings((prev:any)=> ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };
  const updateRoot = (field: string, value: any) => setSettings((prev:any)=> ({...prev, [field]: value}));

  const handleSave = async () => {
    setSaving(true); setMessage("");
    try {
      const res = await fetch("/api/settings", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ siteSettings: settings })});
      const data = await res.json();
      if(data.success) setMessage("✅ Site settings saved! Refresh frontend to see changes.");
      else setMessage("❌ "+data.error);
    } catch(e:any){ setMessage("❌ "+e.message); }
    setSaving(false);
    setTimeout(()=> setMessage(""), 3000);
  };

  if(loading) return <div className="text-center py-12">Loading site settings...</div>;
  if(!settings) return <div>Failed to load</div>;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-black">Site Customization 🎨</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">Website er sob contact, social, footer, logo, announcement ekhan theke change korun - Live update hobe</p>
      </div>

      {message && <div className={`p-3 rounded-xl text-sm font-bold ${message.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700"}`}>{message}</div>}

      {/* General */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border">
        <h3 className="font-black text-lg">🏷️ General Info</h3>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <label><span className="text-xs font-bold">Site Name</span><input value={settings.siteName} onChange={e=> updateRoot("siteName", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">Tagline</span><input value={settings.tagline} onChange={e=> updateRoot("tagline", e.target.value)} placeholder="Premium Shoe Store" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">Logo Text (HOKO)</span><input value={settings.logoText} onChange={e=> updateRoot("logoText", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">Logo Accent (LIFESTYLE)</span><input value={settings.logoAccent} onChange={e=> updateRoot("logoAccent", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
        </div>
      </div>

      {/* Announcement */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border">
        <h3 className="font-black">📢 Announcement Bar (Top)</h3>
        <div className="flex items-center gap-3 mt-4">
          <label className="flex items-center gap-2 font-bold text-sm">
            <input type="checkbox" checked={settings.announcement.enabled} onChange={e=> updateField("announcement","enabled", e.target.checked)} className="accent-black" />
            Enabled
          </label>
        </div>
        <label className="block mt-3"><span className="text-xs font-bold">Announcement Text</span><input value={settings.announcement.text} onChange={e=> updateField("announcement","text", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
      </div>

      {/* Contact */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border">
        <h3 className="font-black">📞 Contact Information</h3>
        <p className="text-xs text-gray-500 dark:text-zinc-400">Footer & Navbar e show hobe</p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <label><span className="text-xs font-bold">Phone 1</span><input value={settings.contact.phone} onChange={e=> updateField("contact","phone", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">Phone 2</span><input value={settings.contact.phone2} onChange={e=> updateField("contact","phone2", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">Email</span><input value={settings.contact.email} onChange={e=> updateField("contact","email", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">Support Email</span><input value={settings.contact.supportEmail} onChange={e=> updateField("contact","supportEmail", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label className="md:col-span-2"><span className="text-xs font-bold">Address</span><input value={settings.contact.address} onChange={e=> updateField("contact","address", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">Hours</span><input value={settings.contact.hours} onChange={e=> updateField("contact","hours", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">Map URL</span><input value={settings.contact.mapUrl} onChange={e=> updateField("contact","mapUrl", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
        </div>
      </div>

      {/* Social */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border">
        <h3 className="font-black">🌐 Social Links</h3>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <label><span className="text-xs font-bold">Facebook</span><input value={settings.social.facebook} onChange={e=> updateField("social","facebook", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">Instagram</span><input value={settings.social.instagram} onChange={e=> updateField("social","instagram", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">YouTube</span><input value={settings.social.youtube} onChange={e=> updateField("social","youtube", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">TikTok</span><input value={settings.social.tiktok} onChange={e=> updateField("social","tiktok", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border">
        <h3 className="font-black">📝 Footer</h3>
        <div className="space-y-4 mt-4">
          <label><span className="text-xs font-bold">Footer Description</span><textarea value={settings.footer.description} onChange={e=> updateField("footer","description", e.target.value)} rows={3} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">Newsletter Title</span><input value={settings.footer.newsletterTitle} onChange={e=> updateField("footer","newsletterTitle", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">Newsletter Description</span><input value={settings.footer.newsletterDesc} onChange={e=> updateField("footer","newsletterDesc", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
          <label><span className="text-xs font-bold">Copyright</span><input value={settings.footer.copyright} onChange={e=> updateField("footer","copyright", e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full bg-black text-white font-black py-4 rounded-full hover:bg-zinc-800 disabled:opacity-50 text-lg">
        {saving ? "Saving..." : "💾 Save All Site Settings"}
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm">
        <strong>💡 Tip:</strong> Save korar por frontend e auto update hobe (Navbar, Footer, Top Bar). Dark mode toggle o ache - customer theme change korte parbe.
      </div>
    </div>
  );
}