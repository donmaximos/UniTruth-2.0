import React, { useState, useMemo, useEffect } from 'react';
import financialDatabase from '../data/financialDatabase.json';
import universitiesDatabase from '../data/universitiesDatabase.json';
import { Shield, Sparkles, MapPin, ChevronDown, ChevronUp, Info, UserPlus, Bus, Car, Clock, List, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
 iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
 iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
 shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function calculateDistance(coords1: { lat: number; lng: number } | undefined, coords2: { lat: number; lng: number } | undefined) {
 if (!coords1 || !coords2) return 0;
 function toRad(x: number) {
 return x * Math.PI / 180;
 }

 const R = 6371; // km
 const x1 = coords2.lat - coords1.lat;
 const dLat = toRad(x1);
 const x2 = coords2.lng - coords1.lng;
 const dLon = toRad(x2);
 const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
 Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) *
 Math.sin(dLon / 2) * Math.sin(dLon / 2);
 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 const d = R * c;
 return d;
}

const mapInstitutionToCity = (institution: string): string => {
 if (['ΟΠΑ', 'ΕΜΠ', 'ΕΚΠΑ'].includes(institution)) {
 return 'Αθήνα';
 }
 if (['Παν. Πατρών', 'ΠΑΠΕΙ'].includes(institution)) {
 return institution === 'ΠΑΠΕΙ' ? 'Αθήνα' : 'Πάτρα';
 }
 return 'Αθήνα';
};

// Component to recenter map when university changes
function MapRecenter({ center }: { center: [number, number] }) {
 const map = useMap();
 useEffect(() => {
 map.setView(center, map.getZoom());
 }, [center, map]);
 return null;
}

export default function ParentFinancialDashboard() {
 const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
 const [selectedUniIdx, setSelectedUniIdx] = useState(0);
 
 // Interactive Financial Levers
 const [coliving, setColiving] = useState(false);
 const [transportMode, setTransportMode] = useState<'public' | 'car'>('public');
 const [realisticTime, setRealisticTime] = useState(true);
 
 // Expanded card state
 const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);

 const university = universitiesDatabase[selectedUniIdx] as any;
 const city = mapInstitutionToCity(university.institution);

 const formatter = new Intl.NumberFormat('el-GR', {
 style: 'currency',
 currency: 'EUR',
 maximumFractionDigits: 0
 });

 const createCustomIcon = (tcd: number) => new L.DivIcon({
 className: 'custom-div-icon',
 html: `<div style="background-color: #f97316; color: white; padding: 4px 8px; border-radius: 8px; font-weight: bold; font-size: 12px; white-space: nowrap; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center; border: 2px solid white;">${formatter.format(tcd)}</div>`,
 iconSize: [80, 28],
 iconAnchor: [40, 14]
 });
 
 const uniIcon = new L.DivIcon({
 className: 'uni-icon',
 html: `<div style="background-color: #0f172a; color: white; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: flex; justify-content: center; align-items: center; border: 2px solid white; width: 32px; height: 32px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg></div>`,
 iconSize: [32, 32],
 iconAnchor: [16, 16]
 });

 const calculations = useMemo(() => {
 // 1. Calculate realistic years
 // Add 1.5 years if realistic time is toggled ON, representing average delays
 const calculatedYears = realisticTime ? university.yearsToGraduate + 1.5 : university.yearsToGraduate;
 
 const neighborhoods = financialDatabase.filter((n: any) => n.cityName === city);
 
 const withTCD = neighborhoods.map((n: any) => {
 // 2. Adjust transport cost
 const finalTransportCost = transportMode === 'public' ? n.transportCost : n.transportCost + 120; // Extra 120 for car (fuel, generic maintenance)
 
 // 3. Adjust rent for co-living
 const finalRent = coliving ? Math.round(n.avgRent / 1.5) : n.avgRent;
 
 const monthlyTotal = finalRent + n.monthlyLivingCost + finalTransportCost;
 const tcd = monthlyTotal * 12 * calculatedYears;
 const distance = calculateDistance(university.coordinates, n.coordinates);
 const activeTravelTime = transportMode === 'public' ? n.travelTimeMinutes?.publicTransit : n.travelTimeMinutes?.privateVehicle;
 
 return { 
 ...n, 
 finalRent,
 finalTransportCost,
 monthlyTotal, 
 tcd,
 calculatedYears,
 distance,
 activeTravelTime
 };
 });
 
 const minTCD = Math.min(...withTCD.map(n => n.tcd));
 
 return { withTCD, minTCD, calculatedYears };
 }, [university, coliving, transportMode, realisticTime, city]);

 return (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 
 {/* Header */}
 <div className="mb-10">
 <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e293b] mb-2">
 Οικονομικός Πίνακας Ελέγχου
 </h2>
 <p className="text-gray-600 font-medium text-lg leading-relaxed max-w-3xl ">
 Διαδραστικός προσομοιωτής συνολικού κόστους σπουδών (TCD) και εξόδων διαβίωσης.
 </p>
 </div>

 {/* Step 1: School Selection */}
 <div className="mb-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl">
 <label className="text-sm font-bold uppercase text-slate-400 mb-3 block">Επιλογή Στόχου Σπουδών</label>
 <select 
 value={selectedUniIdx}
 onChange={e => setSelectedUniIdx(parseInt(e.target.value))}
 className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-600/50 cursor-pointer text-lg "
 >
 {universitiesDatabase.map((uni, idx) => (
 <option key={idx} value={idx}>{uni.departmentName} ({uni.institution})</option>
 ))}
 </select>
 </div>

 {/* Step 2: Interactive Financial Levers */}
 <div className="mb-10 bg-slate-900 rounded-2xl p-6 md:p-8 shadow-md">
 <h3 className="text-xl font-extrabold text-white flex items-center mb-6 ">
 <Sparkles className="w-5 h-5 text-orange-500 mr-2" />
 Παράμετροι Διαβίωσης
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 
 {/* Lever 1: Co-living */}
 <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
 <div className="flex items-center justify-between mb-3">
 <span className="text-slate-300 font-bold flex items-center text-sm md:text-base ">
 <UserPlus className="w-4 h-4 mr-2" /> Συγκατοίκηση
 </span>
 <label className="relative inline-flex items-center cursor-pointer">
 <input type="checkbox" checked={coliving} onChange={() => setColiving(!coliving)} className="sr-only peer" />
 <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
 </label>
 </div>
 <p className="text-slate-400 text-xs font-medium mb-1">Οπτική μείωση ενοικίου /1.5</p>
 </div>

 {/* Lever 2: Transport Mode */}
 <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
 <span className="text-slate-300 font-bold flex items-center text-sm md:text-base mb-3">
 Τρόπος Μετακίνησης
 </span>
 <select 
 value={transportMode}
 onChange={(e) => setTransportMode(e.target.value as 'public' | 'car')}
 className="w-full bg-slate-700 text-white font-bold rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-orange-500 text-sm cursor-pointer border border-slate-600 min-h-[44px]"
 >
 <option value="public">Μέσα Μαζικής Μεταφοράς</option>
 <option value="car">Δικό του Όχημα</option>
 </select>
 </div>

 {/* Lever 3: Realistic Time */}
 <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
 <div className="flex items-center justify-between mb-3">
 <span className="text-slate-300 font-bold flex items-center text-sm md:text-base ">
 <Clock className="w-4 h-4 mr-2" /> Ρεαλιστικός Χρόνος (ΕΘΑΑΕ)
 </span>
 <label className="relative inline-flex items-center cursor-pointer">
 <input type="checkbox" checked={realisticTime} onChange={() => setRealisticTime(!realisticTime)} className="sr-only peer" />
 <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
 </label>
 </div>
 <p className="text-slate-400 text-xs font-medium mb-1">
 Αναπροσαρμογή διάρκειας στα {calculations.calculatedYears} έτη
 </p>
 </div>

 </div>
 </div>

 {/* Step 3 & 4: Dynamic Neighborhood Cards */}
 <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
 <h3 className="text-2xl font-extrabold text-[#1e293b] ">Εναλλακτικές Διαβίωσης ({city})</h3>
 
 <div className="flex bg-slate-100 p-1.5 rounded-xl self-start md:self-auto ring-1 ring-slate-200">
 <button
 onClick={() => setViewMode('list')}
 className={`flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-extrabold transition-all min-h-[44px] ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
 >
 <List className="w-5 h-5 mr-2" />
 Λίστα
 </button>
 <button
 onClick={() => setViewMode('map')}
 className={`flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-extrabold transition-all min-h-[44px] ${viewMode === 'map' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
 >
 <MapIcon className="w-5 h-5 mr-2" />
 Χάρτης
 </button>
 </div>
 </div>
 
 {viewMode === 'list' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {calculations.withTCD.map((neighborhood, idx) => {
 const isValue = neighborhood.tcd === calculations.minTCD;
 const isExpanded = expandedCardIndex === idx;

 return (
 <div 
 key={idx} 
 className={`relative bg-white rounded-3xl p-6 border shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer ${isValue ? 'border-green-500/50 bg-green-50/10' : 'border-gray-200'} ${isExpanded ? 'ring-2 ring-orange-500 border-transparent shadow-lg' : ''}`}
 >
 
 {isValue && (
 <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-extrabold uppercase shadow-sm flex items-center whitespace-nowrap z-10 ">
 <Sparkles className="w-4 h-4 mr-1.5" />
 Value for Money
 </div>
 )}

 <div 
 className="flex flex-col h-full"
 onClick={() => setExpandedCardIndex(isExpanded ? null : idx)}
 >
 <div className="flex justify-between items-start mb-4 mt-3">
 <div>
 <h4 className="text-xl font-extrabold text-[#1e293b] flex items-center mb-1 ">
 <MapPin className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" />
 {neighborhood.neighborhood}
 </h4>
 <p className="text-sm font-bold text-gray-400 ml-7 ">
 Ασφάλεια: {neighborhood.safetyScore}/5
 </p>
 <p className="text-sm font-bold text-gray-400 ml-7 mt-0.5">
 Απόσταση: {neighborhood.distance.toFixed(1)} km από τη σχολή
 </p>
 {neighborhood.activeTravelTime && (
 <p className={`text-sm font-bold ml-7 mt-1 flex items-center ${neighborhood.activeTravelTime > 30 ? 'text-amber-500' : 'text-gray-500'}`}>
 <Clock className="w-4 h-4 mr-1.5" /> Χρόνος Διαδρομής: {neighborhood.activeTravelTime} λεπτά
 </p>
 )}
 </div>
 <div className={`p-2 rounded-full ${isExpanded ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
 {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
 </div>
 </div>

 <div className={`bg-slate-900 rounded-2xl p-6 text-center transform transition-all duration-300 ${isExpanded ? 'mb-4 shadow-inner' : 'mb-0'}`}>
 <p className="text-xs font-bold text-slate-400 uppercase mb-2">Συνολικό Κόστος Σπουδών</p>
 <p className="text-3xl md:text-4xl font-extrabold text-orange-500 drop-shadow-sm">
 {formatter.format(neighborhood.tcd)}
 </p>
 <p className="text-xs font-medium text-slate-500 mt-2 ">
 Για {calculations.calculatedYears} έτη ({calculations.calculatedYears * 12} μήνες)
 </p>
 </div>

 {/* Step 4: Detailed Breakdown */}
 {isExpanded && (
 <div className="animate-in slide-in-from-top-2 fade-in duration-300 mt-4 border-t border-gray-100 pt-4">
 <h5 className="text-sm font-extrabold text-slate-800 uppercase mb-4 text-center">Μηνιαία Ανάλυση</h5>
 
 <div className="space-y-3">
 <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
 <span className="text-sm font-bold text-slate-600 ">Ενοίκιο</span>
 <span className="text-base font-extrabold text-[#1e293b] ">{formatter.format(neighborhood.finalRent)}</span>
 </div>
 
 <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
 <span className="text-sm font-bold text-slate-600 ">Λογαριασμοί & Supermarket</span>
 <span className="text-base font-extrabold text-[#1e293b] ">{formatter.format(neighborhood.monthlyLivingCost)}</span>
 </div>
 
 <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
 <span className="text-sm font-bold text-slate-600 flex items-center">
 Μετακίνηση
 {transportMode === 'car' ? <Car className="w-4 h-4 ml-1.5 text-slate-400" /> : <Bus className="w-4 h-4 ml-1.5 text-slate-400" />}
 </span>
 <span className="text-base font-extrabold text-[#1e293b] ">{formatter.format(neighborhood.finalTransportCost)}</span>
 </div>
 </div>
 
 <div className="mt-4 flex justify-between items-center bg-orange-50 p-3 rounded-lg border border-orange-100">
 <span className="text-sm font-bold text-orange-800 ">Σύνολο Μήνα</span>
 <span className="text-lg font-extrabold text-orange-600 ">{formatter.format(neighborhood.monthlyTotal)}</span>
 </div>

 <div className="mt-5 text-center flex items-start justify-center text-xs text-slate-400 font-medium px-2 pb-2">
 <Info className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
 <p className="text-left leading-relaxed">Ο υπολογισμός βασίζεται σε μέσα κόστη αγοράς και δεν αποτελεί οικονομική συμβουλή.</p>
 </div>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 <div className="bg-slate-800 rounded-3xl min-h-[500px] flex items-center justify-center relative shadow-inner overflow-hidden border border-slate-700 animate-in fade-in duration-500 z-0">
 {university.coordinates ? (
 <MapContainer 
 center={[university.coordinates.lat, university.coordinates.lng]} 
 zoom={12} 
 scrollWheelZoom={true} 
 className="w-full h-[500px] md:h-[600px] rounded-3xl"
 >
 <TileLayer
 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
 />
 <MapRecenter center={[university.coordinates.lat, university.coordinates.lng]} />
 
 {/* University Pin */}
 <Marker position={[university.coordinates.lat, university.coordinates.lng]} icon={uniIcon}>
 <Popup>
 <div className="font-bold text-slate-800 text-sm ">
 Τοποθεσία: {university.institution}
 </div>
 </Popup>
 </Marker>

 {/* Neighborhood Pins */}
 {calculations.withTCD.map((n: any, idx: number) => {
 if (n.coordinates) {
 return (
 <Marker 
 key={idx} 
 position={[n.coordinates.lat, n.coordinates.lng]} 
 icon={createCustomIcon(n.tcd)}
 >
 <Popup>
 <div className="p-2 min-w-[150px]">
 <h4 className="font-extrabold text-slate-800 text-lg mb-1 flex items-center">
 <MapPin className="w-4 h-4 text-orange-500 mr-1" />
 {n.neighborhood}
 </h4>
 <p className="text-xs font-bold text-slate-500 mb-3 ">Ασφάλεια: {n.safetyScore}/5</p>
 
 <div className="flex gap-2 mb-3">
 <div className="bg-slate-50 p-2.5 rounded border border-slate-100 flex-1">
 <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Απόσταση</p>
 <p className="text-sm font-extrabold text-slate-700 flex items-center">
 📏 {n.distance.toFixed(1)} km
 </p>
 </div>
 {n.activeTravelTime && (
 <div className={`p-2.5 rounded border flex-1 ${n.activeTravelTime > 30 ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
 <p className={`text-[10px] uppercase font-bold mb-1 ${n.activeTravelTime > 30 ? 'text-amber-500' : 'text-slate-400'}`}>Χρόνος</p>
 <p className={`text-sm font-extrabold flex items-center ${n.activeTravelTime > 30 ? 'text-amber-700' : 'text-slate-700'}`}>
 ⏱️ {n.activeTravelTime} λεπτά
 </p>
 </div>
 )}
 </div>

 <div className="bg-orange-50 p-2.5 rounded border border-orange-100">
 <p className="text-[10px] uppercase font-bold text-orange-400 mb-1">Συνολικό TCD</p>
 <p className="text-base font-extrabold text-orange-600 ">{formatter.format(n.tcd)}</p>
 </div>
 </div>
 </Popup>
 </Marker>
 );
 }
 return null;
 })}
 </MapContainer>
 ) : (
 <div className="text-center p-8 max-w-lg z-0 relative">
 <MapIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
 <p className="text-slate-400 font-medium text-lg leading-relaxed ">
 Δεν βρέθηκαν συντεταγμένες για το ίδρυμα: {university.institution}
 </p>
 </div>
 )}
 
 {/* Floating sub-card for cheapest neighborhood */}
 <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-80 bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 z-[1000] animate-in slide-in-from-bottom-8 duration-500">
 <div className="absolute -top-3.5 left-6 bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm flex items-center ">
 <Sparkles className="w-3.5 h-3.5 mr-1" />
 Φθηνότερη Επιλογή
 </div>
 <h4 className="text-xl font-extrabold text-[#1e293b] flex items-center mt-3 mb-1.5 ">
 <MapPin className="w-5 h-5 text-orange-500 mr-2" />
 {calculations.withTCD.find(n => n.tcd === calculations.minTCD)?.neighborhood}
 </h4>
 <p className="text-sm font-bold text-gray-500 mb-5 ">Εκτιμώμενο TCD: <span className="text-orange-600 font-extrabold">{formatter.format(calculations.minTCD)}</span></p>
 <button 
 onClick={() => {
 const cheapestIndex = calculations.withTCD.findIndex(n => n.tcd === calculations.minTCD);
 setExpandedCardIndex(cheapestIndex);
 setViewMode('list');
 }} 
 className="w-full bg-slate-50 hover:bg-slate-100 text-[#1e293b] border border-slate-200 text-sm font-extrabold py-3.5 rounded-xl transition-all"
 >
 Προβολή Ανάλυσης
 </button>
 </div>
 </div>
 )}
 </div>
 );
}

