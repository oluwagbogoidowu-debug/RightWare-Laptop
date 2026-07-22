import React, { useState } from 'react';
import { Laptop, LaptopCondition, LaptopSpecs } from '../types';
import { saveLaptopToFirestore, deleteLaptopFromFirestore } from '../lib/firebaseService';
import { 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Settings, 
  LogOut, 
  Package, 
  CheckCircle, 
  X, 
  ChevronRight, 
  Database, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  FilePlus,
  ArrowLeft,
  DollarSign
} from 'lucide-react';

interface AdminPanelProps {
  laptops: Laptop[];
  soldLaptops: Laptop[];
  onUpdateLaptops: (laptops: Laptop[]) => void;
  onUpdateSoldLaptops: (laptops: Laptop[]) => void;
  onClose: () => void;
}

export default function AdminPanel({
  laptops,
  soldLaptops,
  onUpdateLaptops,
  onUpdateSoldLaptops,
  onClose
}: AdminPanelProps) {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('rightware_admin_logged_in') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab state: 'inventory' | 'add' | 'sold'
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'sold'>('inventory');

  // New Laptop Form State
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('Apple');
  const [formYear, setFormYear] = useState(2021);
  const [formPrice, setFormPrice] = useState(600);
  const [formOriginalPrice, setFormOriginalPrice] = useState(1200);
  const [formCondition, setFormCondition] = useState<LaptopCondition>('Very Clean');
  const [formBatteryHealth, setFormBatteryHealth] = useState(90);
  const [formBatteryNote, setFormBatteryNote] = useState('90% Health • Checked & Excellent');
  const [formCpu, setFormCpu] = useState('');
  const [formRam, setFormRam] = useState('16GB RAM');
  const [formStorage, setFormStorage] = useState('512GB NVMe SSD');
  const [formScreen, setFormScreen] = useState('14" Retina Display');
  const [formGraphics, setFormGraphics] = useState('Integrated GPU');
  const [formImage, setFormImage] = useState('');
  const [formStock, setFormStock] = useState(1);
  const [formCategory, setFormCategory] = useState<'School' | 'Work' | 'Design'>('Work');
  const [formDescription, setFormDescription] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formInspection, setFormInspection] = useState(true);
  const [formForSale, setFormForSale] = useState(true);

  // Success Notification
  const [notification, setNotification] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      setIsLoggedIn(true);
      setLoginError('');
      localStorage.setItem('rightware_admin_logged_in', 'true');
    } else {
      setLoginError('Invalid username or password. (Hint: Use admin / password)');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('rightware_admin_logged_in');
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Add a new laptop listing
  const handleAddLaptop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCpu || !formSerial) {
      triggerNotification('Please fill in Model Name, CPU, and Serial Number!');
      return;
    }

    setIsSubmitting(true);

    const defaultImages = {
      Apple: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      Lenovo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      Dell: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
      HP: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    };

    const laptopImage = formImage.trim() || defaultImages[formBrand as keyof typeof defaultImages] || defaultImages.Dell;

    const newLaptop: Laptop = {
      id: `lap-${Date.now()}`,
      name: formName,
      brand: formBrand,
      year: Number(formYear),
      price: Number(formPrice),
      originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
      condition: formCondition,
      batteryHealth: Number(formBatteryHealth),
      batteryNote: formBatteryNote,
      specs: {
        cpu: formCpu,
        ram: formRam,
        storage: formStorage,
        screen: formScreen,
        graphics: formGraphics
      },
      image: laptopImage,
      additionalImages: [laptopImage],
      stockCount: Number(formStock),
      useCategory: formCategory,
      description: formDescription || `Tested and verified ${formCondition} condition ${formName}. Fully ready for productivity.`,
      serialNumber: formSerial,
      inspectionPassed: formInspection,
      isForSale: formForSale
    };

    try {
      await saveLaptopToFirestore(newLaptop);
      const updated = [newLaptop, ...laptops];
      onUpdateLaptops(updated);
      triggerNotification(`Successfully stored in database & launched listing: ${formName}`);
      
      // Reset Form Fields
      setFormName('');
      setFormCpu('');
      setFormSerial('');
      setFormDescription('');
      setFormImage('');
      setFormStock(1);
      setActiveTab('inventory');
    } catch (error) {
      console.error('Error storing laptop in database:', error);
      triggerNotification('Failed to save listing to database. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a laptop listing
  const handleDeleteLaptop = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this listing?')) {
      const updated = laptops.filter(l => l.id !== id);
      onUpdateLaptops(updated);
      deleteLaptopFromFirestore(id).catch(console.error);
      triggerNotification('Listing deleted successfully.');
    }
  };

  // Toggle "For Sale" status
  const handleToggleForSale = (id: string) => {
    const updated = laptops.map(laptop => {
      if (laptop.id === id) {
        const nextVal = laptop.isForSale === false ? true : false;
        const updatedItem = { ...laptop, isForSale: nextVal };
        saveLaptopToFirestore(updatedItem).catch(console.error);
        return updatedItem;
      }
      return laptop;
    });
    onUpdateLaptops(updated);
    triggerNotification('Listing status updated.');
  };

  // Change stock remaining
  const handleStockChange = (id: string, newStock: number) => {
    const val = Math.max(0, newStock);
    const updated = laptops.map(laptop => {
      if (laptop.id === id) {
        const updatedItem = { ...laptop, stockCount: val };
        saveLaptopToFirestore(updatedItem).catch(console.error);
        return updatedItem;
      }
      return laptop;
    });
    onUpdateLaptops(updated);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#FF3B30] selection:text-white">
        
        {/* Back Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 flex items-center space-x-2 text-xs font-mono font-bold text-[#6B6B6B] hover:text-[#111111] transition-colors bg-white px-3.5 py-2 border border-[#E5E5E5] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit to Storefront</span>
        </button>

        <div className="max-w-md w-full bg-white border border-[#E5E5E5] p-8 shadow-sm relative">
          
          <div className="text-center mb-8">
            <span className="font-mono text-[10px] text-[#FF3B30] uppercase tracking-widest font-bold">
              Secure Staff Gateway
            </span>
            <h2 className="font-display font-black text-2xl text-[#111111] tracking-tight mt-1">
              Rightware Admin
            </h2>
            <p className="font-sans text-xs text-[#6B6B6B] mt-1.5">
              Please enter credentials to manage catalog, stock counts & review listings.
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-xs flex items-center space-x-2 mb-6">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5 font-bold">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-white border border-[#E5E5E5] px-3.5 py-2.5 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5 font-bold">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="w-full bg-white border border-[#E5E5E5] px-3.5 py-2.5 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 active:bg-[#FF3B30] text-white font-sans text-xs font-bold py-3 transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Authorize & Login</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E5E5E5] text-center">
            <p className="font-mono text-[9px] text-neutral-400 leading-normal">
              Demo Access: <span className="text-[#111111] font-bold">admin</span> / <span className="text-[#111111] font-bold">password</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#111111] font-sans selection:bg-[#FF3B30] selection:text-white flex flex-col justify-between">
      
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="bg-[#FF3B30] text-white p-2 flex items-center justify-center">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-base sm:text-lg tracking-tight text-[#111111] flex items-center space-x-2">
                <span>Rightware Laptops</span>
                <span className="font-mono text-[9px] bg-[#111111] text-white px-2 py-0.5 tracking-widest font-black uppercase">
                  ADMIN PANEL
                </span>
              </h1>
              <p className="font-mono text-[9px] text-[#6B6B6B] mt-0.5 uppercase tracking-wider">
                Logged in as Head Engineer • Catalog Controller
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="bg-white hover:bg-neutral-50 text-[#111111] font-sans text-xs font-bold px-4 py-2.5 border border-[#E5E5E5] transition-colors cursor-pointer flex items-center space-x-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Storefront</span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-[#111111] hover:bg-black text-white font-sans text-xs font-bold px-4 py-2.5 transition-colors cursor-pointer flex items-center space-x-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Dashboard Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Success Notifications Overlay */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white border-l-4 border-[#FF3B30] p-4 shadow-xl font-sans text-xs flex items-center justify-between space-x-4 max-w-md animate-slide-in">
            <div className="flex items-center space-x-2.5">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400 flex-shrink-0" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-neutral-400 hover:text-white cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Dashboard Quick Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#E5E5E5] p-4 shadow-xs">
            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">Total Active Inventory</span>
            <span className="font-display font-black text-2xl text-[#111111] mt-1.5 block">{laptops.length}</span>
            <span className="font-sans text-[10px] text-[#6B6B6B] mt-1 block">Verified & cataloged units</span>
          </div>

          <div className="bg-white border border-[#E5E5E5] p-4 shadow-xs">
            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">Currently For Sale</span>
            <span className="font-display font-black text-2xl text-[#FF3B30] mt-1.5 block">
              {laptops.filter(l => l.isForSale !== false).length}
            </span>
            <span className="font-sans text-[10px] text-emerald-600 mt-1 block">Listed on client catalog</span>
          </div>

          <div className="bg-white border border-[#E5E5E5] p-4 shadow-xs">
            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">Hidden Listings</span>
            <span className="font-display font-black text-2xl text-[#111111] mt-1.5 block">
              {laptops.filter(l => l.isForSale === false).length}
            </span>
            <span className="font-sans text-[10px] text-neutral-400 mt-1 block">Drafts / Out of rotation</span>
          </div>

          <div className="bg-white border border-[#E5E5E5] p-4 shadow-xs">
            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">Total Sold Units</span>
            <span className="font-display font-black text-2xl text-neutral-500 mt-1.5 block">{soldLaptops.length}</span>
            <span className="font-sans text-[10px] text-[#6B6B6B] mt-1 block">Archived client reviews</span>
          </div>
        </div>

        {/* Workspace Workspace Tabs Navigation */}
        <div className="border-b border-[#E5E5E5] flex space-x-1.5 mb-6">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-3 font-sans text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'inventory' 
                ? 'border-[#FF3B30] text-[#111111]' 
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Review Listings ({laptops.length})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-3 font-sans text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'add' 
                ? 'border-[#FF3B30] text-[#111111]' 
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <span className="flex items-center space-x-2">
              <FilePlus className="h-4 w-4" />
              <span>Add Product Listing</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sold')}
            className={`px-4 py-3 font-sans text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'sold' 
                ? 'border-[#FF3B30] text-[#111111]' 
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Archive & Feedback ({soldLaptops.length})</span>
            </span>
          </button>
        </div>

        {/* TAB 1: Inventory Table & Control */}
        {activeTab === 'inventory' && (
          <div className="bg-white border border-[#E5E5E5] overflow-hidden">
            <div className="p-5 border-b border-[#E5E5E5] bg-[#FAF9F9]">
              <h2 className="font-display font-bold text-sm text-[#111111]">
                Active Inventory Management
              </h2>
              <p className="font-sans text-xs text-[#6B6B6B] mt-1">
                Toggle display status, change real-time stock levels, or permanently wipe old listings.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead className="bg-[#FAF9F9] border-b border-[#E5E5E5] font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-bold">Laptop Model</th>
                    <th className="p-4 font-bold">Spec Summary</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Stock Remaining</th>
                    <th className="p-4 font-bold">Listing Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {laptops.map((laptop) => (
                    <tr key={laptop.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={laptop.image} 
                            alt={laptop.name} 
                            className="w-12 h-9 object-cover border border-[#E5E5E5]"
                          />
                          <div>
                            <span className="font-bold text-[#111111] block hover:text-[#FF3B30] transition-colors">
                              {laptop.name}
                            </span>
                            <span className="font-mono text-[9px] text-[#6B6B6B] block mt-0.5">
                              S/N: {laptop.serialNumber} • Year: {laptop.year}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-neutral-600 max-w-xs truncate">
                        <div className="space-y-0.5 text-[11px]">
                          <div><strong className="font-mono text-[9px] uppercase font-bold">CPU:</strong> {laptop.specs.cpu}</div>
                          <div><strong className="font-mono text-[9px] uppercase font-bold">Mem:</strong> {laptop.specs.ram} / {laptop.specs.storage}</div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-[#111111]">
                        ${laptop.price}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleStockChange(laptop.id, laptop.stockCount - 1)}
                            className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-[#111111] font-mono text-xs cursor-pointer border border-[#D4D4D4]"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={laptop.stockCount}
                            onChange={(e) => handleStockChange(laptop.id, parseInt(e.target.value) || 0)}
                            className="w-12 bg-white border border-[#E5E5E5] px-1.5 py-1 text-center font-mono font-bold text-xs"
                          />
                          <button
                            onClick={() => handleStockChange(laptop.id, laptop.stockCount + 1)}
                            className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-[#111111] font-mono text-xs cursor-pointer border border-[#D4D4D4]"
                          >
                            +
                          </button>

                          {laptop.stockCount === 0 ? (
                            <span className="font-mono text-[9px] bg-red-50 text-[#FF3B30] px-1.5 py-0.5 border border-red-200 font-bold ml-2">
                              OUT OF STOCK
                            </span>
                          ) : laptop.stockCount === 1 ? (
                            <span className="font-mono text-[9px] bg-orange-50 text-orange-700 px-1.5 py-0.5 border border-orange-200 font-bold ml-2 animate-pulse">
                              LOW STOCK
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleForSale(laptop.id)}
                          className="flex items-center space-x-2 text-xs font-medium cursor-pointer focus:outline-hidden"
                        >
                          {laptop.isForSale !== false ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                              <Eye className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="font-mono text-[10px] font-bold">FOR SALE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[#6B6B6B] bg-neutral-100 px-2.5 py-1 border border-[#D4D4D4]">
                              <EyeOff className="h-3.5 w-3.5 text-neutral-500" />
                              <span className="font-mono text-[10px] font-bold">NOT FOR SALE</span>
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteLaptop(laptop.id)}
                          className="p-1.5 text-neutral-400 hover:text-[#FF3B30] border border-transparent hover:border-red-100 rounded-none cursor-pointer transition-all"
                          title="Delete product listing"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {laptops.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#6B6B6B] font-sans">
                        No product listings found. Click "Add Product Listing" to insert your first workstation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Add New Workstation Form */}
        {activeTab === 'add' && (
          <form onSubmit={handleAddLaptop} className="bg-white border border-[#E5E5E5] p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-display font-bold text-sm text-[#111111]">
                Launch New Laptop Listing
              </h2>
              <p className="font-sans text-xs text-[#6B6B6B] mt-1">
                Enter precise physical condition details, diagnostic outputs, serial codes and detailed specifications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Box 1: Core Details */}
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider font-bold border-b border-[#E5E5E5] pb-2">
                  1. Identity & Pricing
                </h3>

                <div>
                  <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Apple MacBook Pro 16 (M2 Pro)"
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Brand *
                    </label>
                    <select
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    >
                      <option value="Apple">Apple</option>
                      <option value="Dell">Dell</option>
                      <option value="Lenovo">Lenovo</option>
                      <option value="HP">HP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Year *
                    </label>
                    <input
                      type="number"
                      required
                      value={formYear}
                      onChange={(e) => setFormYear(parseInt(e.target.value) || 2021)}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Our Price ($USD) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Original Price ($USD)
                    </label>
                    <input
                      type="number"
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Stock Count *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Best Use Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    >
                      <option value="School">School / Research</option>
                      <option value="Work">Office / Productivity</option>
                      <option value="Design">Creative / Design</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Box 2: Diagnostics & Image */}
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider font-bold border-b border-[#E5E5E5] pb-2">
                  2. Quality Check & Image
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Condition *
                    </label>
                    <select
                      value={formCondition}
                      onChange={(e) => setFormCondition(e.target.value as LaptopCondition)}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    >
                      <option value="Very Clean">Very Clean</option>
                      <option value="Clean">Clean</option>
                      <option value="Good">Good</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Battery Health (%) *
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      required
                      value={formBatteryHealth}
                      onChange={(e) => setFormBatteryHealth(parseInt(e.target.value) || 90)}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                    Battery Diagnostic Note *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBatteryNote}
                    onChange={(e) => setFormBatteryNote(e.target.value)}
                    placeholder="90% Health • 74 Cycles • Excellent"
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                    placeholder="e.g. C02G298MQ05D"
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                    Image URL (Leave blank for default placeholder)
                  </label>
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* Box 3: Specifications */}
              <div className="space-y-4">
                <h3 className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider font-bold border-b border-[#E5E5E5] pb-2">
                  3. Hardware Specifications
                </h3>

                <div>
                  <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                    CPU Details *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCpu}
                    onChange={(e) => setFormCpu(e.target.value)}
                    placeholder="Apple M2 Pro (10-Core) or i7-12700H"
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      RAM Size *
                    </label>
                    <input
                      type="text"
                      required
                      value={formRam}
                      onChange={(e) => setFormRam(e.target.value)}
                      placeholder="e.g., 16GB LPDDR5"
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      SSD Storage *
                    </label>
                    <input
                      type="text"
                      required
                      value={formStorage}
                      onChange={(e) => setFormStorage(e.target.value)}
                      placeholder="e.g., 512GB NVMe SSD"
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Screen Display *
                    </label>
                    <input
                      type="text"
                      required
                      value={formScreen}
                      onChange={(e) => setFormScreen(e.target.value)}
                      placeholder="e.g. 16 Liquid Retina 120Hz"
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Graphics Card
                    </label>
                    <input
                      type="text"
                      value={formGraphics}
                      onChange={(e) => setFormGraphics(e.target.value)}
                      placeholder="e.g. Intel Iris Xe / Nvidia RTX"
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-1.5 font-mono text-[10px]">
                  <label className="flex items-center space-x-2 cursor-pointer font-sans text-xs text-[#111111] font-bold">
                    <input
                      type="checkbox"
                      checked={formInspection}
                      onChange={(e) => setFormInspection(e.target.checked)}
                      className="accent-[#FF3B30] h-4 w-4"
                    />
                    <span>45-Point Physical Audit Passed</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer font-sans text-xs text-[#111111] font-bold">
                    <input
                      type="checkbox"
                      checked={formForSale}
                      onChange={(e) => setFormForSale(e.target.checked)}
                      className="accent-[#FF3B30] h-4 w-4"
                    />
                    <span>Immediately list for sale on the live catalog</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-bold text-neutral-700">
                Detailed Condition & Diagnostic Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Write a custom description explaining cosmetic scuffs, screen health, hinge quality, or charging items included..."
                className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-[#E5E5E5] flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#FF3B30] hover:bg-[#FF3B30]/90 active:bg-[#FF3B30] disabled:bg-neutral-400 text-white font-sans text-xs font-bold px-8 py-3.5 transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{isSubmitting ? 'Saving to Database...' : 'Verify & Store in Database'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: SOLD Products & Feedbacks list */}
        {activeTab === 'sold' && (
          <div className="bg-white border border-[#E5E5E5] overflow-hidden">
            <div className="p-5 border-b border-[#E5E5E5] bg-[#FAF9F9]">
              <h2 className="font-display font-bold text-sm text-[#111111]">
                Archived Sales & Client Reviews
              </h2>
              <p className="font-sans text-xs text-[#6B6B6B] mt-1">
                These laptops have been sold and completed. Reviews left by clients appear here.
              </p>
            </div>

            <div className="divide-y divide-[#E5E5E5]">
              {soldLaptops.map((laptop) => (
                <div key={laptop.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={laptop.image} 
                      alt={laptop.name} 
                      className="w-16 h-12 object-cover border border-[#E5E5E5] flex-shrink-0 filter grayscale"
                    />
                    <div>
                      <h4 className="font-sans font-bold text-[#111111] text-sm">
                        {laptop.name}
                      </h4>
                      <p className="font-mono text-[9px] text-[#6B6B6B] mt-0.5">
                        S/N: {laptop.serialNumber} • Buyer Name: <strong className="text-[#111111]">{laptop.buyerName || 'Verified Client'}</strong>
                      </p>
                      {laptop.buyerFeedback ? (
                        <p className="font-sans text-xs text-[#555555] italic mt-2.5 bg-neutral-50 p-3 border border-dashed border-[#D4D4D4] leading-relaxed relative">
                          "{laptop.buyerFeedback}"
                        </p>
                      ) : (
                        <span className="font-mono text-[9px] text-neutral-400 block mt-2">
                          No feedback message provided yet.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-mono text-[10px] text-[#FF3B30] uppercase font-bold tracking-wider block">
                      {laptop.deliveredDate || 'DELIVERED'}
                    </span>
                    <span className="font-mono text-sm font-bold text-neutral-400 line-through mt-1 block">
                      ${laptop.price}
                    </span>
                  </div>
                </div>
              ))}
              {soldLaptops.length === 0 && (
                <div className="p-8 text-center text-[#6B6B6B] font-sans">
                  No sold archive found.
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Footer copyright */}
      <footer className="border-t border-[#E5E5E5] py-5 text-center font-mono text-[9px] text-neutral-400">
        © 2026 Rightware Laptops Staff Portal. All diagnostics and serial records are encrypted.
      </footer>

    </div>
  );
}
