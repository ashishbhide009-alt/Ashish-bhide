import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flower2, Wind, Map, Palette, Loader2, Sparkles, Sprout, Grid3X3, Hammer, Camera, Upload, X, Box, Sun, CloudRain, CloudFog, Clock } from "lucide-react";
import { cn } from "./lib/utils";
import { generateGardenDesign, type GardenPreferences, type GardenDesign } from "./services/geminiService";
import Garden3D from "./components/Garden3D";

const CLIMATES = ["Tropical", "Arid / Desert", "Mediterranean", "Temperate", "Alpine", "Coastal"];
const STYLES = ["Minimalist Zen", "English Cottage", "Modern Architectural", "Wild Meadow", "French Formal", "Japanese Tea Garden"];
const SIZES = ["Balcony / Small Patio", "Backyard Urban", "Large Suburban Plot", "Country Acreage"];
const FEATURES = ["Water Feature", "Vegetable Patch", "Fire Pit", "Outdoor Seating", "Wildflower Meadow", "Walking Path", "Fruit Trees"];

const LIBRARY_DATA = [
  {
    title: "Minimalist Zen Retreat",
    style: "Modern",
    image: "https://images.unsplash.com/photo-1558905758-2f16a227364a?auto=format&fit=crop&q=80&w=800",
    description: "A masterclass in restraint, balancing stone and structural elements."
  },
  {
    title: "English Cottage Wilds",
    style: "Cottage",
    image: "https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=800",
    description: "Abundant perennials and winding paths for a romantic atmosphere."
  },
  {
    title: "Mediterranean Terrace",
    style: "Coastal",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800",
    description: "Olive trees and drought-tolerant lavender over terraced stone."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"designer" | "library">("designer");
  const [step, setStep] = useState<"prefs" | "loading" | "result">("prefs");
  const [prefs, setPrefs] = useState<GardenPreferences>({
    climate: "",
    style: "",
    size: "",
    features: [],
  });
  const [design, setDesign] = useState<GardenDesign | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [is3DMode, setIs3DMode] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(14);
  const [weather, setWeather] = useState<"sunny" | "rainy" | "foggy">("sunny");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFeature = (feature: string) => {
    setPrefs(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrefs(prev => ({ ...prev, referenceImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPrefs(prev => ({ ...prev, referenceImage: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDesign = async () => {
    setStep("loading");
    try {
      const generatedDesign = await generateGardenDesign(prefs);
      setDesign(generatedDesign);
      
      // Select a realistic placeholder based on the chosen style
      const styleKey = prefs.style.toLowerCase();
      let placeholder = "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1200";
      
      if (styleKey.includes("zen") || styleKey.includes("japanese")) {
        placeholder = "https://images.unsplash.com/photo-1558905758-2f16a227364a?auto=format&fit=crop&q=80&w=1200";
      } else if (styleKey.includes("modern")) {
        placeholder = "https://images.unsplash.com/photo-1549400812-42111eb4c602?auto=format&fit=crop&q=80&w=1200";
      } else if (styleKey.includes("formal")) {
        placeholder = "https://images.unsplash.com/photo-1601662528567-526cd06f6582?auto=format&fit=crop&q=80&w=1200";
      } else if (styleKey.includes("cottage")) {
        placeholder = "https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=1200";
      }
      
      setImageUrl(placeholder);
      setStep("result");
    } catch (error) {
      console.error("Design generation failed:", error);
      setStep("prefs");
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 text-emerald-900">
      <nav className="sticky top-0 z-50 h-20 bg-white border-b-4 border-emerald-100">
        <div className="max-w-7xl mx-auto px-10 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-200">
              🌱
            </div>
            <span className="text-2xl font-black tracking-tight text-emerald-800">VerdantAI</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex bg-emerald-50 p-1 rounded-full border border-emerald-100">
              <button 
                onClick={() => setActiveTab("designer")}
                className={cn(
                  "px-6 py-2 rounded-full font-bold text-sm transition-all",
                  activeTab === "designer" ? "bg-white text-emerald-800 shadow-sm" : "text-emerald-400"
                )}
              >
                Designer
              </button>
              <button 
                onClick={() => setActiveTab("library")}
                className={cn(
                  "px-6 py-2 rounded-full font-bold text-sm transition-all",
                  activeTab === "library" ? "bg-white text-emerald-800 shadow-sm" : "text-emerald-400"
                )}
              >
                Library
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-64 h-64 bg-emerald-100/40 rounded-full blur-2xl" />

        <div className="p-4 md:p-8 relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === "library" ? (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto py-12"
              >
                <div className="mb-12 text-center">
                  <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Curated Inspiration</h2>
                  <h1 className="text-5xl font-black text-emerald-900 tracking-tighter uppercase mb-4">Realistic Portfolios</h1>
                  <p className="text-emerald-700/60 font-medium">Explore high-fidelity garden archetypes to ground your design thinking.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {LIBRARY_DATA.map((item, i) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      key={item.title}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-[4/3] rounded-[40px] overflow-hidden mb-6 border-4 border-white shadow-xl shadow-emerald-200/50 group-hover:shadow-2xl transition-all group-hover:-translate-y-2">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{item.style}</span>
                      <h3 className="text-xl font-black text-emerald-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-emerald-700 font-medium leading-relaxed">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                <header className="max-w-4xl mx-auto mt-12 mb-20 text-center">
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest mb-4"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Intelligent Landscape Design</span>
                  </motion.div>
                  <h1 className="text-4xl md:text-7xl font-black text-emerald-900 mb-4 tracking-tighter uppercase">Garden Architect</h1>
                  <p className="text-lg text-emerald-700/80 max-w-2xl mx-auto font-medium">
                    Transform your outdoor space into a masterwork of botanical art.
                  </p>
                </header>

                <main className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {step === "prefs" && (
            <motion.div
              key="prefs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              {/* Site Reference Upload */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Camera className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">0. Site Reference (Optional)</h2>
                </div>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative w-full aspect-[21/9] rounded-[40px] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group overflow-hidden",
                    prefs.referenceImage 
                      ? "border-emerald-500 bg-emerald-50" 
                      : "border-emerald-100 bg-white hover:border-emerald-200"
                  )}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {prefs.referenceImage ? (
                    <>
                      <img 
                        src={prefs.referenceImage} 
                        alt="Reference" 
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                      />
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="bg-white p-3 rounded-2xl shadow-xl">
                          <X className="w-6 h-6 text-red-500" onClick={(e) => { e.stopPropagation(); removeImage(); }} />
                        </div>
                        <span className="bg-white/80 backdrop-blur px-4 py-1 rounded-full text-xs font-black uppercase text-emerald-700">Image Loaded</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-emerald-50 p-6 rounded-3xl group-hover:scale-110 transition-transform mb-4">
                        <Upload className="w-8 h-8 text-emerald-500" />
                      </div>
                      <p className="font-bold text-emerald-800">Upload your garden photo</p>
                      <p className="text-sm text-emerald-400 font-medium">AI will analyze your terrain and architecture</p>
                    </>
                  )}
                </div>
              </section>

              {/* Climate Selection */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Wind className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">1. Climate Blueprint</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {CLIMATES.map(c => (
                    <button
                      key={c}
                      onClick={() => setPrefs(p => ({ ...p, climate: c }))}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-left font-bold",
                        prefs.climate === c 
                          ? "bg-emerald-500 border-b-4 border-emerald-700 text-white shadow-lg scale-[1.02]" 
                          : "bg-white border-emerald-100 hover:bg-emerald-50 text-emerald-700"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </section>

              {/* Style Selection */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Palette className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">2. Design Archetype</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {STYLES.map(s => (
                    <button
                      key={s}
                      onClick={() => setPrefs(p => ({ ...p, style: s }))}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-left font-bold",
                        prefs.style === s 
                          ? "bg-emerald-500 border-b-4 border-emerald-700 text-white shadow-lg scale-[1.02]" 
                          : "bg-white border-emerald-100 hover:bg-emerald-50 text-emerald-700"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              {/* Size Selection */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Map className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">3. Territorial Scale</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {SIZES.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setPrefs(p => ({ ...p, size: sz }))}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-left font-bold",
                        prefs.size === sz 
                          ? "bg-emerald-500 border-b-4 border-emerald-700 text-white shadow-lg scale-[1.02]" 
                          : "bg-white border-emerald-100 hover:bg-emerald-50 text-emerald-700"
                      )}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </section>

              {/* Features Toggle */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400">4. Ecosystem Features</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {FEATURES.map(f => (
                    <button
                      key={f}
                      onClick={() => toggleFeature(f)}
                      className={cn(
                        "px-6 py-2 rounded-2xl border-2 transition-all font-bold",
                        prefs.features.includes(f)
                          ? "bg-emerald-900 border-b-4 border-black text-white shadow-md shadow-emerald-200"
                          : "bg-white border-emerald-100 hover:bg-emerald-50 text-emerald-700"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </section>

              <div className="flex justify-center pt-8">
                <button
                  disabled={!prefs.climate || !prefs.style || !prefs.size}
                  onClick={handleDesign}
                  className="px-12 py-5 bg-amber-400 text-amber-900 rounded-2xl font-black text-xl border-b-4 border-amber-600 shadow-lg shadow-amber-200 hover:brightness-105 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-3 uppercase tracking-tighter"
                >
                  <Sparkles className="w-6 h-6" />
                  Generate Layout
                </button>
              </div>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="relative mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border-8 border-emerald-100 border-t-emerald-500 rounded-full"
                />
                <Sprout className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">Cultivating Your Design</h2>
              <p className="text-emerald-700 font-medium">Mapping paths, selecting species, and optimizing light.</p>
            </motion.div>
          )}

          {step === "result" && design && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Site Comparison Logic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prefs.referenceImage && (
                    <div className="relative aspect-video rounded-[32px] overflow-hidden border-4 border-white shadow-xl">
                      <img src={prefs.referenceImage} alt="Reference" className="w-full h-full object-cover" />
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                        Your Space
                      </div>
                    </div>
                  )}
                  {/* Visualizer Container */}
                  <div className={cn(
                    "relative aspect-video rounded-[32px] overflow-hidden bg-emerald-50 border-4 border-white shadow-xl shadow-emerald-200/50 group flex flex-col",
                    !prefs.referenceImage && "md:col-span-2 rounded-[40px] border-8 border-emerald-100"
                  )}>
                    {/* Interaction Toggle */}
                    <div className="absolute top-6 right-6 z-20 flex bg-white/90 backdrop-blur p-1 rounded-2xl border-2 border-emerald-100 shadow-lg">
                      <button 
                        onClick={() => setIs3DMode(false)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2",
                          !is3DMode ? "bg-emerald-500 text-white shadow-md shadow-emerald-100" : "text-emerald-400 hover:bg-emerald-50"
                        )}
                      >
                        <Camera className="w-3 h-3" />
                        2D Vision
                      </button>
                      <button 
                        onClick={() => setIs3DMode(true)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2",
                          is3DMode ? "bg-emerald-500 text-white shadow-md shadow-emerald-100" : "text-emerald-400 hover:bg-emerald-50"
                        )}
                      >
                        <Box className="w-3 h-3" />
                        3D Simulation
                      </button>
                    </div>

                    <div className="flex-1 relative">
                      <AnimatePresence mode="wait">
                        {is3DMode ? (
                          <motion.div 
                            key="3d" 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="w-full h-full"
                          >
                            <Garden3D design={design} timeOfDay={timeOfDay} weather={weather} />
                            
                            {/* Simulation Controls */}
                            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
                              <div className="flex bg-white/90 backdrop-blur p-2 rounded-2xl border-2 border-emerald-100 shadow-lg pointer-events-auto gap-4">
                                <div className="flex items-center gap-3 px-2 border-r border-emerald-100">
                                  <Clock className="w-4 h-4 text-emerald-500" />
                                  <input 
                                    type="range" 
                                    min="0" 
                                    max="23" 
                                    value={timeOfDay} 
                                    onChange={(e) => setTimeOfDay(parseInt(e.target.value))}
                                    className="w-24 accent-emerald-500"
                                  />
                                  <span className="text-[10px] font-black text-emerald-800 w-8">{timeOfDay}:00</span>
                                </div>
                                <div className="flex items-center gap-2 px-2">
                                  <button 
                                    onClick={() => setWeather("sunny")}
                                    className={cn("p-2 rounded-lg transition-colors", weather === "sunny" ? "bg-amber-100 text-amber-600" : "text-emerald-300 hover:bg-emerald-50")}
                                  >
                                    <Sun className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => setWeather("rainy")}
                                    className={cn("p-2 rounded-lg transition-colors", weather === "rainy" ? "bg-blue-100 text-blue-600" : "text-emerald-300 hover:bg-emerald-50")}
                                  >
                                    <CloudRain className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => setWeather("foggy")}
                                    className={cn("p-2 rounded-lg transition-colors", weather === "foggy" ? "bg-slate-100 text-slate-600" : "text-emerald-300 hover:bg-emerald-50")}
                                  >
                                    <CloudFog className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="2d" 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="w-full h-full"
                          >
                            {imageUrl ? (
                              <img 
                                src={imageUrl} 
                                alt={design.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = `https://images.unsplash.com/photo-1558905758-2f16a227364a?auto=format&fit=crop&q=80&w=1200`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(#d1fae5_1px,transparent_1px)] [background-size:20px_20px]">
                                <Sprout className="w-12 h-12 text-emerald-300 animate-pulse" />
                              </div>
                            )}
                            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl border-2 border-emerald-100 shadow-lg">
                              <h3 className="font-black text-sm flex items-center gap-2"> <span className="text-emerald-500">●</span> {design.title}.grdn</h3>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

              <div className="bg-white p-10 rounded-[40px] shadow-sm border-4 border-emerald-50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter">{design.title}</h2>
                    <div className="flex gap-2">
                       <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100 italic">Hyper-Realistic Render</span>
                    </div>
                  </div>
                  <p className="text-lg text-emerald-700 font-medium leading-relaxed mb-8">{design.description}</p>
                  
                  <div className="space-y-8">
                    <div className="flex items-start gap-5">
                      <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-100">
                        <Grid3X3 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Architectural Blueprint</h3>
                        <p className="text-emerald-800 font-bold leading-relaxed">{design.layoutDescription}</p>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-slate-900 text-slate-300 border-4 border-slate-800 shadow-inner">
                      <div className="flex items-center gap-2 mb-3">
                        <Camera className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Visualization Engine Prompt</h4>
                      </div>
                      <p className="text-xs font-mono italic leading-relaxed text-slate-400">
                        "{design.visualPrompt}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {design.recommendedPlants.map((plant, i) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      key={plant.scientificName}
                      className="bg-white p-6 rounded-3xl border-4 border-transparent hover:border-emerald-100 transition-all hover:shadow-xl group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">{plant.role}</span>
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          plant.careLevel === "Low" ? "bg-green-400" :
                          plant.careLevel === "Medium" ? "bg-amber-400" : "bg-red-400"
                        )} />
                      </div>
                      <h4 className="text-xl font-black text-emerald-800 group-hover:text-emerald-500 transition-colors">{plant.name}</h4>
                      <p className="text-sm italic font-medium text-emerald-400 mb-4">{plant.scientificName}</p>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-emerald-300 uppercase">Care Requirement: {plant.careLevel}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[40px] border-4 border-emerald-50 shadow-sm relative overflow-hidden">
                   <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-500 rounded-lg text-white">
                        <Hammer className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Maintenance Protocol</h3>
                    </div>
                    <ul className="space-y-4">
                      {design.maintenanceTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 bg-emerald-50/50 p-3 rounded-2xl text-emerald-800 font-bold text-sm border-2 border-transparent hover:border-emerald-100 transition-colors">
                          <span className="text-emerald-500 font-black">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button 
                  onClick={() => setStep("prefs")}
                  className="w-full py-5 bg-white text-emerald-700 font-black rounded-3xl border-b-4 border-emerald-100 hover:bg-emerald-50 active:translate-y-1 active:border-b-0 transition-all uppercase tracking-tighter"
                >
                  New Prototype
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-4xl mx-auto mt-24 text-center border-t-4 border-emerald-100 pt-12 pb-12">
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={cn("w-3 h-3 rounded-full", ["bg-emerald-500", "bg-amber-400", "bg-pink-400", "bg-purple-400"][i])} />
          ))}
        </div>
        <p className="text-[10px] text-emerald-300 uppercase tracking-widest font-black">Powered by VerdantAI Botanical Engine</p>
      </footer>
    </>
  )}
</AnimatePresence>
</div>
</div>
</div>
);
}
