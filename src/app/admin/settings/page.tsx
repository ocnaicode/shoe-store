"use client";
import { useEffect, useState } from "react";

type Tab = "cloudinary" | "social" | "whatsapp" | "steadfast" | "general";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<Tab>("cloudinary");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [testUploading, setTestUploading] = useState(false);
  const [testResult, setTestResult] = useState("");

  useEffect(() => {
    fetch("/api/settings").then(r=>r.json()).then(d=> { setSettings(d); setLoading(false); });
  }, []);

  const updateField = (section: string, field: string, value: any) => {
    setSettings((prev:any)=> ({...prev, [section]: {...prev[section], [field]: value}}));
  };

  const saveSection = async (sectionData: any) => {
    setSaving(true); setMessage("");
    try {
      const res = await fetch("/api/settings", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(sectionData)});
      const data = await res.json();
      if(data.success) { setMessage("✅ Saved successfully!"); setSettings(data.settings); }
      else setMessage("❌ "+data.error);
    } catch(e:any){ setMessage("❌ "+e.message); }
    setSaving(false);
    setTimeout(()=> setMessage(""), 3000);
  };

  const handleCloudinarySave = () => saveSection({ cloudinary: {
    cloudName: settings.cloudinary.cloudName,
    apiKey: settings.cloudinary.apiKey,
    apiSecret: settings.cloudinary.apiSecret?.includes("•") ? undefined : settings.cloudinary.apiSecret,
    uploadPreset: settings.cloudinary.uploadPreset,
  }});

  const handleSocialSave = () => saveSection({ socialLogin: settings.socialLogin });
  const handleWhatsappSave = () => saveSection({ whatsapp: settings.whatsapp, abandonedCart: settings.abandonedCart });
  const handleSteadfastSave = () => saveSection({ steadfast: {
    enabled: settings.steadfast.enabled,
    apiKey: settings.steadfast.apiKey?.includes("•") ? undefined : settings.steadfast.apiKey,
    secretKey: settings.steadfast.secretKey?.includes("•") ? undefined : settings.steadfast.secretKey,
    baseUrl: settings.steadfast.baseUrl,
  }});

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    setTestUploading(true); setTestResult("");
    const fd = new FormData(); fd.append("file", file);
    fd.append("config", JSON.stringify({ cloudName: settings.cloudinary.cloudName, apiKey: settings.cloudinary.apiKey, apiSecret: settings.cloudinary.apiSecret.includes("•") ? "" : settings.cloudinary.apiSecret }));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if(data.secure_url || data.url) setTestResult(data.fallback ? "⚠️ Fallback (not Cloudinary): Configure credentials first" : "✅ Upload success! URL: "+data.secure_url.slice(0,60));
      else setTestResult("❌ "+data.error);
    } catch(err:any){ setTestResult("❌ "+err.message); }
    setTestUploading(false);
  };

  if(loading) return <div className="text-center py-12">Loading settings...</div>;
  if(!settings) return <div>Failed to load</div>;

  const tabs: {id: Tab, label: string, icon: string}[] = [
    {id: "cloudinary", label: "Cloudinary", icon: "☁️"},
    {id: "social", label: "Social Login", icon: "🔑"},
    {id: "whatsapp", label: "WhatsApp & Cart", icon: "💬"},
    {id: "steadfast", label: "Steadfast Courier", icon: "🚚"},
    {id: "general", label: "General & SEO", icon: "⚙️"},
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-black">Settings - Full Control Panel</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400"> sob kichu ekhan theke control koren - Cloudinary, Social Login, WhatsApp, Abandoned Cart, Steadfast, Flash Sale sob</p>
      </div>

      <div className="flex gap-2 overflow-auto pb-2">
        {tabs.map(t=> (
          <button key={t.id} onClick={()=> setActiveTab(t.id)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap flex items-center gap-2 ${activeTab===t.id ? "bg-black text-white" : "bg-white dark:bg-zinc-900 border hover:bg-gray-50"}`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {message && <div className={`p-3 rounded-xl text-sm font-bold ${message.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>{message}</div>}

      {activeTab==="cloudinary" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <h3 className="text-xl font-black">☁️ Cloudinary Configuration</h3>
            <p className="text-sm opacity-90">Sob image ekhane upload hobe - CDN e fast deliver</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              <div className="font-bold">📌 Cloudinary kivabe paben?</div>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li><a href="https://cloudinary.com" target="_blank" className="underline text-blue-600 font-bold">cloudinary.com</a> e free account korun</li>
                <li>Dashboard e giye Cloud Name, API Key, API Secret copy korun</li>
                <li>Niche paste kore Save korun</li>
              </ol>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label><span className="text-xs font-bold">Cloud Name *</span><input value={settings.cloudinary.cloudName} onChange={e=> updateField("cloudinary","cloudName",e.target.value)} placeholder="my-cloud" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
              <label><span className="text-xs font-bold">API Key *</span><input value={settings.cloudinary.apiKey} onChange={e=> updateField("cloudinary","apiKey",e.target.value)} placeholder="123..." className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
              <label><span className="text-xs font-bold">API Secret *</span><input type="password" value={settings.cloudinary.apiSecret.includes("•") ? "" : settings.cloudinary.apiSecret} onChange={e=> updateField("cloudinary","apiSecret",e.target.value)} placeholder={settings.cloudinary.apiSecret.includes("•") ? "•••• (already saved)" : "secret"} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
              <label><span className="text-xs font-bold">Upload Preset</span><input value={settings.cloudinary.uploadPreset} onChange={e=> updateField("cloudinary","uploadPreset",e.target.value)} placeholder="hokolifestyle_preset" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCloudinarySave} disabled={saving} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-full disabled:opacity-50">{saving ? "Saving..." : "💾 Save Cloudinary"}</button>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-black text-sm">🧪 Test Upload</h4>
              <label className="mt-2 inline-flex bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer">
                {testUploading ? "Uploading..." : "Choose Image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleTestUpload} disabled={testUploading} />
              </label>
              {testResult && <div className="mt-2 p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl text-xs border break-all">{testResult}</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab==="social" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">🔑 Social Login Control</h3>
              <label className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full font-bold text-sm">
                <input type="checkbox" checked={settings.socialLogin.enabled} onChange={e=> updateField("socialLogin","enabled",e.target.checked)} className="accent-black" />
                {settings.socialLogin.enabled ? "Enabled ✅" : "Disabled"}
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">Admin ekhan theke Google/Facebook login ON/OFF korte parbe. Disable korle shudhu Email/Password e login hobe. Checkout e auto account create always ON.</p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="border-2 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black flex items-center gap-2"><img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="" /> Google Login</h4>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.socialLogin.googleEnabled} onChange={e=> updateField("socialLogin","googleEnabled",e.target.checked)} className="accent-black" />
                    <span className="text-sm font-bold">{settings.socialLogin.googleEnabled ? "ON" : "OFF"}</span>
                  </label>
                </div>
                <div className="space-y-3 mt-4">
                  <label><span className="text-xs font-bold">Google Client ID</span><input value={settings.socialLogin.googleClientId} onChange={e=> updateField("socialLogin","googleClientId",e.target.value)} placeholder="xxx.apps.googleusercontent.com" className="w-full mt-1 border rounded-xl px-3 py-2.5 text-sm" /></label>
                  <label><span className="text-xs font-bold">Google Client Secret</span><input type="password" value={settings.socialLogin.googleClientSecret.includes("•") ? "" : settings.socialLogin.googleClientSecret} onChange={e=> updateField("socialLogin","googleClientSecret",e.target.value)} placeholder="GOCSPX-..." className="w-full mt-1 border rounded-xl px-3 py-2.5 text-sm" /></label>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-xs mt-3">
                  <a href="https://console.cloud.google.com" target="_blank" className="underline font-bold text-blue-600">console.cloud.google.com</a> → Create OAuth 2.0 Credential → Authorized redirect: https://yourdomain.com/api/auth/callback/google
                </div>
              </div>

              <div className="border-2 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black flex items-center gap-2"><span className="w-5 h-5 bg-[#1877F2] text-white rounded-full flex items-center justify-center text-xs">f</span> Facebook Login</h4>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.socialLogin.facebookEnabled} onChange={e=> updateField("socialLogin","facebookEnabled",e.target.checked)} className="accent-black" />
                    <span className="text-sm font-bold">{settings.socialLogin.facebookEnabled ? "ON" : "OFF"}</span>
                  </label>
                </div>
                <div className="space-y-3 mt-4">
                  <label><span className="text-xs font-bold">Facebook App ID</span><input value={settings.socialLogin.facebookAppId} onChange={e=> updateField("socialLogin","facebookAppId",e.target.value)} placeholder="123..." className="w-full mt-1 border rounded-xl px-3 py-2.5 text-sm" /></label>
                  <label><span className="text-xs font-bold">Facebook App Secret</span><input type="password" value={settings.socialLogin.facebookAppSecret.includes("•") ? "" : settings.socialLogin.facebookAppSecret} onChange={e=> updateField("socialLogin","facebookAppSecret",e.target.value)} placeholder="..." className="w-full mt-1 border rounded-xl px-3 py-2.5 text-sm" /></label>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-xs mt-3">
                  <a href="https://developers.facebook.com" target="_blank" className="underline font-bold text-blue-600">developers.facebook.com</a> → Create App → Facebook Login
                </div>
              </div>
            </div>

            <div className="bg-gray-900 text-white rounded-xl p-4 mt-6">
              <h4 className="font-black text-sm">🔄 Auto Account Logic (Checkout)</h4>
              <ul className="text-xs mt-2 space-y-1 list-disc ml-5 opacity-80">
                <li>User checkout e jei email dibe, seta diye auto account create hobe (jodi age na thake)</li>
                <li>Password initially blank thakbe - User Dashboard → Change Password theke set korte parbe</li>
                <li>Social login e click korle mock auto-create hobe - Production e real OAuth connect korun</li>
                <li>Admin chaile ekhan theke Social Login full disable kore shudhu Email/Password rakhte pare</li>
              </ul>
            </div>

            <button onClick={handleSocialSave} disabled={saving} className="mt-6 w-full bg-black text-white font-black py-3 rounded-full disabled:opacity-50">{saving ? "Saving..." : "💾 Save Social Login Settings"}</button>
          </div>
        </div>
      )}

      {activeTab==="whatsapp" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-6">
            <h3 className="font-black text-lg">💬 WhatsApp Live Chat</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Floating WhatsApp button sob page e show hobe</p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <label className="flex items-center gap-3 md:col-span-2 bg-green-50 border border-green-200 rounded-xl p-3">
                <input type="checkbox" checked={settings.whatsapp.enabled} onChange={e=> updateField("whatsapp","enabled",e.target.checked)} className="accent-green-600" />
                <span className="font-bold">Enable WhatsApp Button {settings.whatsapp.enabled ? "✅" : "❌"}</span>
              </label>
              <label><span className="text-xs font-bold">Phone Number (with country code)</span><input value={settings.whatsapp.phoneNumber} onChange={e=> updateField("whatsapp","phoneNumber",e.target.value)} placeholder="8801700000000" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
              <label><span className="text-xs font-bold">Popup Message</span><input value={settings.whatsapp.popupMessage} onChange={e=> updateField("whatsapp","popupMessage",e.target.value)} placeholder="Need help? Chat with us!" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
              <label className="md:col-span-2"><span className="text-xs font-bold">Default Message (user click korle ja jabe)</span><textarea value={settings.whatsapp.message} onChange={e=> updateField("whatsapp","message",e.target.value)} rows={2} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
            </div>
            <button onClick={handleWhatsappSave} disabled={saving} className="mt-4 bg-green-600 text-white font-bold px-8 py-3 rounded-full">{saving ? "Saving..." : "💾 Save WhatsApp"}</button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-6">
            <h3 className="font-black text-lg">🛒 Abandoned Cart Recovery</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">User cart e product rekhe chole gele popup + discount offer</p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <label className="flex items-center gap-3 md:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <input type="checkbox" checked={settings.abandonedCart.enabled} onChange={e=> updateField("abandonedCart","enabled",e.target.checked)} className="accent-black" />
                <span className="font-bold">Enable Abandoned Cart {settings.abandonedCart.enabled ? "✅" : "❌"}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.abandonedCart.popupEnabled} onChange={e=> updateField("abandonedCart","popupEnabled",e.target.checked)} /> <span className="text-sm font-bold">Popup Enabled</span>
              </label>
              <label><span className="text-xs font-bold">Delay (minutes)</span><input type="number" value={settings.abandonedCart.delayMinutes} onChange={e=> updateField("abandonedCart","delayMinutes",Number(e.target.value))} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
              <label><span className="text-xs font-bold">Discount Code to Offer</span><input value={settings.abandonedCart.discountCode} onChange={e=> updateField("abandonedCart","discountCode",e.target.value.toUpperCase())} placeholder="COMEBACK10" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm uppercase" /></label>
              <label><span className="text-xs font-bold">Discount %</span><input type="number" value={settings.abandonedCart.discountPercent} onChange={e=> updateField("abandonedCart","discountPercent",Number(e.target.value))} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
              <label className="md:col-span-2"><span className="text-xs font-bold">Popup Message</span><input value={settings.abandonedCart.message} onChange={e=> updateField("abandonedCart","message",e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
            </div>
            <div className="mt-4 bg-gray-900 text-white rounded-xl p-4 text-xs">
              <div className="font-bold">🎯 Kivabe kaj kore?</div>
              <ul className="list-disc ml-5 mt-2 space-y-1 opacity-80">
                <li>User cart e product add kore 2 minute (setting) kichu na kine thakle popup show</li>
                <li>Mouse browser er baire niye gele (exit intent) o popup show</li>
                <li>Discount code auto cart e apply hoye jabe</li>
                <li>Future e Email/SMS o pathano jabe (SendGrid/Twilio integrate korte hobe)</li>
              </ul>
            </div>
            <button onClick={handleWhatsappSave} disabled={saving} className="mt-4 bg-black text-white font-bold px-8 py-3 rounded-full">{saving ? "Saving..." : "💾 Save Abandoned Cart"}</button>
          </div>
        </div>
      )}

      {activeTab==="steadfast" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
            <h3 className="text-xl font-black">🚚 Steadfast Courier API</h3>
            <p className="text-sm opacity-90">Order Shipped korle auto courier entry hobe - Tracking soho</p>
          </div>
          <div className="p-6 space-y-5">
            <label className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800 border-2 rounded-xl p-4">
              <input type="checkbox" checked={settings.steadfast.enabled} onChange={e=> updateField("steadfast","enabled",e.target.checked)} className="accent-green-600 w-5 h-5" />
              <div>
                <div className="font-black">Enable Steadfast Integration {settings.steadfast.enabled ? "✅" : "❌ Disabled (mock mode)"}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400">Disable thakle mock tracking number generate hobe, enable korle real API call jabe</div>
              </div>
            </label>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
              <div className="font-bold">📌 Steadfast API Key kivabe paben?</div>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li><a href="https://portal.packzy.com" target="_blank" className="underline font-bold text-blue-600">portal.packzy.com</a> e Steadfast account korun</li>
                <li>Login → <strong>API Key</strong> menu te jan</li>
                <li>Api-Key & Secret-Key copy kore niche paste korun</li>
                <li>Base URL default: <code className="bg-white dark:bg-zinc-900 px-1 rounded">https://portal.packzy.com/api/v1</code></li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <label><span className="text-xs font-bold">API Key *</span><input value={settings.steadfast.apiKey.includes("•") ? "" : settings.steadfast.apiKey} onChange={e=> updateField("steadfast","apiKey",e.target.value)} placeholder={settings.steadfast.apiKey.includes("•") ? "•••• saved" : "your api key"} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
              <label><span className="text-xs font-bold">Secret Key *</span><input type="password" value={settings.steadfast.secretKey.includes("•") ? "" : settings.steadfast.secretKey} onChange={e=> updateField("steadfast","secretKey",e.target.value)} placeholder={settings.steadfast.secretKey.includes("•") ? "•••• saved" : "secret key"} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
              <label className="md:col-span-2"><span className="text-xs font-bold">Base URL</span><input value={settings.steadfast.baseUrl} onChange={e=> updateField("steadfast","baseUrl",e.target.value)} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" /></label>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSteadfastSave} disabled={saving} className="bg-green-600 text-white font-bold px-8 py-3 rounded-full">{saving ? "Saving..." : "💾 Save Steadfast"}</button>
              <button onClick={async ()=>{
                const res = await fetch("/api/steadfast/create", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ recipient_name: "Test User", recipient_phone: "01700000000", recipient_address: "Dhaka", cod_amount: 1000 })});
                const data = await res.json();
                alert(JSON.stringify(data, null, 2));
              }} className="border px-6 py-3 rounded-full font-bold hover:bg-gray-50 dark:bg-zinc-800">🧪 Test API</button>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-xs">
              <div className="font-bold">📦 Order Flow:</div>
              <div className="mt-2 space-y-1 text-gray-600 dark:text-zinc-300">
                <div>1. Customer order kore → Status: <strong>pending</strong></div>
                <div>2. Admin Orders page e giye <strong>Shipped</strong> korle auto Steadfast e consignment create hobe</div>
                <div>3. Tracking code order e save hobe, customer Track Order page e dekhte parbe</div>
                <div>4. Checkout e COD amount auto Steadfast e jabe</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab==="general" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border">
            <h3 className="font-black">Site & SEO</h3>
            <div className="space-y-3 mt-4 text-sm">
              <div className="flex justify-between border rounded-xl p-3"><span>Sitemap.xml</span><span className="text-green-600 font-bold">✅ Auto</span></div>
              <div className="flex justify-between border rounded-xl p-3"><span>Robots.txt</span><span className="text-green-600 font-bold">✅ Configured</span></div>
              <div className="flex justify-between border rounded-xl p-3"><span>JSON-LD</span><span className="text-green-600 font-bold">✅ Enabled</span></div>
              <div className="flex justify-between border rounded-xl p-3"><span>Photo Reviews Schema</span><span className="text-green-600 font-bold">✅ Added</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border">
            <h3 className="font-black">MongoDB</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Fallback file storage active - MONGODB_URI set korle auto switch</p>
            <div className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-xs mt-4">MONGODB_URI=mongodb+srv://...</div>
          </div>
        </div>
      )}
    </div>
  );
}