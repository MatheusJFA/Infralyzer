"use client";

import React, { useState} from 'react';
import { TuiSection} from "@/components/ui/TuiSection";
import { TuiButton} from "@/components/ui/TuiButton";
import { TuiDataBox} from "@/components/ui/TuiDataBox";
import Link from "next/link";
import { TuiFormGroup} from "@/components/ui/TuiFormGroup";
import { TuiBanner} from "@/components/ui/TuiBanner";
import { TuiLoading} from "@/components/ui/TuiLoading";
import { InfoTooltip} from "@/components/InfoTooltip";
import { MetricSlider} from "@/components/forms/MetricsForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DesignSystemPage() {
 const [isLoading, setIsLoading] = useState(false);
 const [sliderValue, setSliderValue] = useState(500000);

 return (
 <main className="min-h-screen uppercase flex flex-col relative overflow-x-hidden w-full max-w-5xl mx-auto border-x border-paper-outline/20 pb-24 px-4 md:px-0">
 
 <header className="flex justify-between items-center p-6 border-b border-paper-outline/30 bg-background/50 backdrop-blur-sm z-10 sticky top-0">
 <div className="flex flex-col gap-1">
   <Link href="/dashboard" className="text-[10px] text-paper-primary/60 hover:text-paper-primary flex items-center gap-1 transition-colors group mb-1">
     <ArrowLeft size={10} className="group-hover:-translate-x-0.5 transition-transform" /> [ BACK_TO_SYSTEM ]
   </Link>
   <h1 className="text-xl tracking-widest font-bold ">
   {'>'} BLUEPRINT_DS <span className="">_</span>
   </h1>
 </div>
 <div className="text-xs text-muted-foreground tracking-widest font-mono">v1.1.0</div>
 </header>

 <div className="p-6 space-y-12">
 {/* Intro */}
 <section>
 <p className="text-sm leading-relaxed max-w-3xl opacity-80 normal-case font-mono">
 This design system rejects the "friendly" and "rounded" tropes of modern SaaS in favor of a technical, high-precision architectural blueprint aesthetic. It is inspired by engineering drafts, blueprints, and high-end editorial technical layouts. We are building a "Precision Console"—an interface that prioritizes raw data density, technical authority, and structural clarity.
 </p>
 </section>

 {/* Colors */}
 <TuiSection title="Colors & Surface Logic">
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 <div className="p-6 bg-paper-primary text-card font-bold border border-paper-primary ">
 <div className="text-sm">Primary</div>
 <div className="text-[10px] opacity-70 font-mono mt-2">bg-paper-primary</div>
 </div>
 <div className="p-6 bg-background text-paper-primary border border-paper-outline/40">
 <div className="text-sm">Neutral</div>
 <div className="text-[10px] opacity-70 font-mono mt-2">bg-background</div>
 </div>
 <div className="p-6 bg-paper-secondary text-paper-primary border border-paper-outline/40">
 <div className="text-sm">Secondary</div>
 <div className="text-[10px] opacity-70 font-mono mt-2">bg-paper-secondary</div>
 </div>
 <div className="p-6 bg-paper-outline text-white border border-white/20">
 <div className="text-sm">Tertiary</div>
 <div className="text-[10px] opacity-70 font-mono mt-2">bg-paper-outline</div>
 </div>
 <div className="p-6 bg-card border border-paper-outline text-paper-primary">
 <div className="text-sm">Background</div>
 <div className="text-[10px] opacity-70 font-mono mt-2">bg-card</div>
 </div>
 </div>
 <div className="mt-4 p-4 border border-paper-outline/30 border-dashed text-xs tracking-widest text-muted-foreground normal-case font-mono">
 * The "No-Line" Rule: Standard 1px solid dividers are strictly prohibited for sectioning. Separation must be achieved through background shifts.
 </div>
 </TuiSection>

 {/* Typography */}
 <TuiSection title="Typography Highlights">
 <div className="space-y-8">
 <div className="border-l-2 border-paper-primary pl-4">
 <div className="text-[10px] text-muted-foreground tracking-widest mb-2">Display / Header (text-4xl, font-bold)</div>
 <h1 className="text-4xl tracking-tighter font-bold ">CONSOLE HEADER</h1>
 </div>
 <div className="border-l-2 border-paper-primary pl-4">
 <div className="text-[10px] text-muted-foreground tracking-widest mb-2">Body / Data Value (text-xl, font-bold)</div>
 <p className="text-xl font-bold">1,048,576.00</p>
 </div>
 <div className="border-l-2 border-paper-primary pl-4">
 <div className="text-[10px] text-muted-foreground tracking-widest mb-2">Label / Metadata (text-xs, tracking-widest)</div>
 <p className="text-xs text-muted-foreground tracking-widest uppercase">READ / WRITE RATIO</p>
 </div>
 </div>
 </TuiSection>

 {/* Components */}
 <TuiSection title="Component Library">
 <div className="space-y-16">
 
 {/* Buttons */}
 <div>
 <h3 className="text-[11px] font-bold tracking-widest uppercase text-paper-primary mb-6">{'>'} Buttons</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
 <TuiButton>
 Standard Action
 </TuiButton>
 <TuiButton onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 2000);}} loading={isLoading}>
 Trigger Loader
 </TuiButton>
 </div>
 </div>

 {/* Data Boxes */}
 <div>
 <h3 className="text-[11px] font-bold tracking-widest uppercase text-paper-primary mb-6">{'>'} Data Boxes</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <TuiDataBox 
 label="Average QPS (Grid Item)" 
 value="57,870" 
 infoText="Standard large value display for raw numerical readouts." 
 />
 <TuiDataBox 
 label="Peak QPS (With Subvalue)" 
 value="289,352" 
 subValue="+231,481 vs Normal"
 infoText="Data Box supporting sub-values (deltas) underneath the main number."
 />
 </div>
 </div>

 {/* Forms */}
 <div>
 <h3 className="text-[11px] font-bold tracking-widest uppercase text-paper-primary mb-6">{'>'} Form Groups & Inputs</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <TuiFormGroup>
 <div className="flex flex-col gap-3">
 <label className="text-[11px] text-muted-foreground tracking-widest flex items-center uppercase">
 <span className="mr-2">Example Setting Threshold</span>
 <InfoTooltip content="TuiFormGroup boxes settings in a darker panel with subtle borders." />
 </label>
 <input 
 type="text" 
 defaultValue="1.0" 
 readOnly
 className="w-full sm:w-64 text-center text-xl font-bold bg-background text-paper-primary px-2 py-3 rounded-none shadow-none border border-paper-outline focus:border-paper-primary focus:outline-none focus:ring-1 focus:ring-paper-primary "
 />
 </div>
 </TuiFormGroup>

 <MetricSlider
 label="Sample Metric Input"
 name="sampleSlider"
 value={sliderValue}
 min={100}
 max={1000000}
 step={100}
 onValueChange={(_, val) => setSliderValue(val)}
 suffix="UNITS"
 infoText="A highly flexible sliding input component with preset buttons."
 editable
 presets={[
 { label: "1K", value: 1000},
 { label: "10K", value: 10000},
 { label: "100K", value: 100000},
 { label: "500K", value: 500000},
 { label: "1M", value: 1000000},
 ]}
 />
 </div>
 </div>

 {/* Banners */}
 <div>
 <h3 className="text-[11px] font-bold tracking-widest uppercase text-paper-primary mb-6">{'>'} Information Banners</h3>
 <div className="space-y-4">
 <TuiBanner variant="dashed">
 This is a dashed banner. Hover effects apply to the border style.
 </TuiBanner>
 <TuiBanner variant="solid">
 This is a solid banner, commonly used for critical system messages or rigid headers.
 </TuiBanner>
 </div>
 </div>

 {/* Loaders */}
 <div>
 <h3 className="text-[11px] font-bold tracking-widest uppercase text-paper-primary mb-6">{'>'} Skeleton & Loaders</h3>
 <div className="bg-paper-secondary/40 border border-paper-outline/20">
 <TuiLoading message="FETCHING_DS_RESOURCES" minHeight="250px" />
 </div>
 </div>

 </div>
 </TuiSection>
 </div>
 </main>
 );
}
