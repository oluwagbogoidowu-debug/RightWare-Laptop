import React, { useState, useEffect } from 'react';
import { CustomSelect } from './CustomSelect';
import { Laptop, LaptopCondition, LaptopSpecs } from '../types';
import { saveLaptopToFirestore, deleteLaptopFromFirestore } from '../lib/firebaseService';
import { formatNaira, convertGoogleDriveUrl } from '../lib/utils';
import { auth, googleProvider, ALLOWED_ADMIN_EMAILS } from '../firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
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
  DollarSign,
  ShieldCheck,
  UserCheck,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Upload,
  HardDrive,
  ExternalLink,
  Image as ImageIcon,
  Star,
  Edit3
} from 'lucide-react';

export const GPU_OPTIONS = [
  {
    group: 'AMD Radeon',
    options: [
      'AMD Radeon 540X',
      'AMD Radeon Graphics',
      'AMD Radeon Pro Series',
      'AMD Radeon RX 5500M',
      'AMD Radeon RX 6500M',
      'AMD Radeon RX 6600M',
      'AMD Radeon RX 6700M',
      'AMD Radeon RX 6800M',
      'AMD Radeon RX 7600M',
      'AMD Radeon RX 7700S',
      'AMD Radeon RX 7800M'
    ]
  },
  {
    group: 'Apple Silicon GPU',
    options: [
      'Apple M1 GPU',
      'Apple M2 GPU',
      'Apple M2 Pro GPU',
      'Apple M2 Max GPU',
      'Apple M3 GPU',
      'Apple M3 Pro GPU',
      'Apple M3 Max GPU'
    ]
  },
  {
    group: 'Intel Graphics',
    options: [
      'Intel Arc Graphics',
      'Intel Iris Xe Graphics',
      'Intel UHD Graphics'
    ]
  },
  {
    group: 'NVIDIA GeForce GTX & MX',
    options: [
      'NVIDIA GeForce GTX 1650',
      'NVIDIA GeForce GTX 1660 Ti',
      'NVIDIA GeForce MX350',
      'NVIDIA GeForce MX450'
    ]
  },
  {
    group: 'NVIDIA GeForce RTX 20 & 30 Series',
    options: [
      'NVIDIA GeForce RTX 2050',
      'NVIDIA GeForce RTX 3050',
      'NVIDIA GeForce RTX 3050 Ti',
      'NVIDIA GeForce RTX 3060',
      'NVIDIA GeForce RTX 3070',
      'NVIDIA GeForce RTX 3070 Ti',
      'NVIDIA GeForce RTX 3080',
      'NVIDIA GeForce RTX 3080 Ti'
    ]
  },
  {
    group: 'NVIDIA GeForce RTX 40 Series',
    options: [
      'NVIDIA GeForce RTX 4050',
      'NVIDIA GeForce RTX 4060',
      'NVIDIA GeForce RTX 4070',
      'NVIDIA GeForce RTX 4080',
      'NVIDIA GeForce RTX 4090'
    ]
  },
  {
    group: 'NVIDIA Workstation RTX',
    options: [
      'NVIDIA RTX A1000',
      'NVIDIA RTX A2000',
      'NVIDIA RTX A3000',
      'NVIDIA RTX A4000'
    ]
  }
];

export const ALL_PRESET_GPUS = GPU_OPTIONS.flatMap((g) => g.options);

export const RAM_OPTIONS = [
  '4GB',
  '8GB',
  '12GB',
  '16GB',
  '24GB',
  '32GB',
  '48GB',
  '64GB',
  '96GB',
  '128GB'
];

export const STORAGE_OPTIONS = [
  '128GB',
  '256GB',
  '512GB',
  '1TB',
  '2TB',
  '4TB',
  '8TB'
];

export const SCREEN_OPTIONS = [
  '11" HD Display',
  '12" HD Display',
  '13" Full HD Display',
  '13.3" Retina Display',
  '14" Full HD Display',
  '14" Retina Display',
  '15" Full HD Display',
  '15.6" Full HD Display',
  '15.6" OLED Display',
  '16" Retina Display',
  '16" Liquid Retina Display',
  '17" Full HD Display',
  '17.3" Full HD Display',
  '17.3" QHD Display',
  '17.3" 4K UHD Display'
];

export const BRAND_OPTIONS = [
  'Acer',
  'Apple',
  'ASUS',
  'Dell',
  'Dynabook',
  'Fujitsu',
  'Gigabyte',
  'HP',
  'Huawei',
  'Infinix',
  'LG',
  'Lenovo',
  'Microsoft',
  'MSI',
  'Razer',
  'Samsung',
  'Sony',
  'Toshiba',
  'VAIO',
  'Xiaomi'
];

export const USE_CASE_OPTIONS = [
  'Business / Office Work',
  'Student / School Use',
  'Programming / Development',
  'UI/UX Design',
  'Graphic Design',
  'Video Editing',
  '3D Modeling / Animation',
  'Gaming',
  'Streaming / Content Creation',
  'Data Analysis',
  'Machine Learning / AI',
  'Cybersecurity / Networking',
  'Music Production',
  'General Everyday Use'
];

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [loginError, setLoginError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Email & Password Form Inputs
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const userEmailLower = user.email.toLowerCase();
        if (ALLOWED_ADMIN_EMAILS.includes(userEmailLower)) {
          setIsLoggedIn(true);
          setAdminEmail(user.email);
          setLoginError('');
        } else {
          setIsLoggedIn(false);
          setAdminEmail('');
          setLoginError(`Access Denied: "${user.email}" is not authorized to access the admin portal.`);
          signOut(auth).catch(console.error);
        }
      } else {
        setIsLoggedIn(false);
        setAdminEmail('');
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoginError('');
    setIsAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase() || '';
      if (ALLOWED_ADMIN_EMAILS.includes(email)) {
        setIsLoggedIn(true);
        setAdminEmail(result.user.email || '');
      } else {
        await signOut(auth);
        setIsLoggedIn(false);
        setLoginError(`Access Denied: "${result.user.email}" is not authorized. Authorized accounts only.`);
      }
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setLoginError('Sign-in cancelled by user.');
      } else if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setLoginError(
          `Unauthorized Domain Error: The current domain (${window.location.hostname}) is not authorized in your Firebase Console.`
        );
      } else {
        setLoginError(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Email & Password Form Submission
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedEmail = emailInput.trim().toLowerCase();
    if (!trimmedEmail) {
      setLoginError('Please enter your email address.');
      return;
    }

    if (!ALLOWED_ADMIN_EMAILS.includes(trimmedEmail)) {
      setLoginError(`Access Denied: "${trimmedEmail}" is not an authorized administrator email. Only whitelisted emails are allowed.`);
      return;
    }

    if (!passwordInput || passwordInput.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    setIsAuthLoading(true);

    try {
      if (authMode === 'login') {
        try {
          const userCred = await signInWithEmailAndPassword(auth, trimmedEmail, passwordInput);
          setAdminEmail(userCred.user.email || trimmedEmail);
          setIsLoggedIn(true);
        } catch (err: any) {
          if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            try {
              const newCred = await createUserWithEmailAndPassword(auth, trimmedEmail, passwordInput);
              setAdminEmail(newCred.user.email || trimmedEmail);
              setIsLoggedIn(true);
            } catch (createErr: any) {
              if (createErr.code === 'auth/email-already-in-use') {
                setLoginError('Incorrect password entered.');
              } else {
                setLoginError(createErr.message || 'Failed to log in with email/password.');
              }
            }
          } else {
            setLoginError(err.message || 'Failed to log in.');
          }
        }
      } else {
        // Sign Up Mode
        try {
          const userCred = await createUserWithEmailAndPassword(auth, trimmedEmail, passwordInput);
          setAdminEmail(userCred.user.email || trimmedEmail);
          setIsLoggedIn(true);
        } catch (err: any) {
          if (err.code === 'auth/email-already-in-use') {
            try {
              const userCred = await signInWithEmailAndPassword(auth, trimmedEmail, passwordInput);
              setAdminEmail(userCred.user.email || trimmedEmail);
              setIsLoggedIn(true);
            } catch (signErr: any) {
              setLoginError('An account with this email exists. Incorrect password entered.');
            }
          } else {
            setLoginError(err.message || 'Failed to create account.');
          }
        }
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setLoginError(err.message || 'Authentication error.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setIsLoggedIn(false);
    setAdminEmail('');
  };

  // Tab state: 'inventory' | 'add' | 'sold'
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'sold'>('inventory');

  // New Laptop Form State
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('Apple');
  const [formPrice, setFormPrice] = useState(600);
  const [formOriginalPrice, setFormOriginalPrice] = useState(1200);
  const [formCondition, setFormCondition] = useState<LaptopCondition>('Very Clean');
  const [formBatteryHealth, setFormBatteryHealth] = useState(90);
  const [formBatteryNote, setFormBatteryNote] = useState('90% Health • Checked & Excellent');
  const [formCpu, setFormCpu] = useState('');
  const [formRam, setFormRam] = useState('16GB');
  const [formStorage, setFormStorage] = useState('512GB');
  const [formScreen, setFormScreen] = useState('14" Retina Display');
  const [formGraphics, setFormGraphics] = useState('Intel Iris Xe Graphics');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [imageSourceMode, setImageSourceMode] = useState<'file' | 'drive'>('file');
  const [fileName, setFileName] = useState<string>('');
  const [driveLinkInput, setDriveLinkInput] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    const filesArray = Array.from(files) as File[];
    let processed = 0;

    filesArray.forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        triggerNotification(`Skipped ${file.name}: File exceeds 8MB.`);
        processed++;
        if (processed === filesArray.length && newImages.length > 0) {
          setFormImages((prev) => [...prev, ...newImages]);
        }
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          newImages.push(reader.result as string);
        }
        processed++;
        if (processed === filesArray.length) {
          setFormImages((prev) => [...prev, ...newImages]);
          triggerNotification(`Added ${newImages.length} image(s).`);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddDriveUrl = () => {
    if (!driveLinkInput.trim()) return;
    const rawInput = driveLinkInput.trim();
    const links = rawInput.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    const convertedLinks = links.map(convertGoogleDriveUrl);

    if (convertedLinks.length > 0) {
      setFormImages((prev) => [...prev, ...convertedLinks]);
      setDriveLinkInput('');
      triggerNotification(`Added ${convertedLinks.length} Google Drive/Web image(s).`);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMakePrimaryImage = (index: number) => {
    if (index === 0) return;
    setFormImages((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
  };
  const [formStock, setFormStock] = useState(1);
  const [formCategory, setFormCategory] = useState<string>('Business / Office Work');
  const [formDescription, setFormDescription] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formInspection, setFormInspection] = useState(true);
  const [formForSale, setFormForSale] = useState(true);

  // Edit Laptop Modal State
  const [editingLaptop, setEditingLaptop] = useState<Laptop | null>(null);
  const [editForm, setEditForm] = useState<Partial<Laptop>>({});
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editDriveInput, setEditDriveInput] = useState<string>('');

  const handleStartEdit = (laptop: Laptop) => {
    setEditingLaptop(laptop);
    setEditForm({ ...laptop });
    const existingImgs = laptop.additionalImages?.length ? laptop.additionalImages : (laptop.image ? [laptop.image] : []);
    setEditImages(existingImgs);
    setEditDriveInput('');
  };

  const handleEditFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    const filesArray = Array.from(files) as File[];
    let processed = 0;

    filesArray.forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        triggerNotification(`Skipped ${file.name}: File exceeds 8MB.`);
        processed++;
        if (processed === filesArray.length && newImages.length > 0) {
          setEditImages((prev) => [...prev, ...newImages]);
        }
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          newImages.push(reader.result as string);
        }
        processed++;
        if (processed === filesArray.length) {
          setEditImages((prev) => [...prev, ...newImages]);
          triggerNotification(`Added ${newImages.length} image(s).`);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddEditDriveUrl = () => {
    if (!editDriveInput.trim()) return;
    const rawInput = editDriveInput.trim();
    const links = rawInput.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    const convertedLinks = links.map(convertGoogleDriveUrl);

    if (convertedLinks.length > 0) {
      setEditImages((prev) => [...prev, ...convertedLinks]);
      setEditDriveInput('');
      triggerNotification(`Added ${convertedLinks.length} image link(s).`);
    }
  };

  const handleSaveEditLaptop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLaptop) return;

    const defaultImages = {
      Apple: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      Lenovo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      Dell: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
      HP: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    };

    const fallbackImg = defaultImages[(editForm.brand || editingLaptop.brand) as keyof typeof defaultImages] || defaultImages.Dell;
    const primaryImg = editImages.length > 0 ? editImages[0] : fallbackImg;
    const allImgs = editImages.length > 0 ? editImages : [fallbackImg];

    const updatedLaptop: Laptop = {
      ...editingLaptop,
      name: editForm.name || editingLaptop.name,
      brand: editForm.brand || editingLaptop.brand,
      price: Number(editForm.price ?? editingLaptop.price),
      originalPrice: editForm.originalPrice ? Number(editForm.originalPrice) : undefined,
      condition: (editForm.condition as LaptopCondition) || editingLaptop.condition,
      batteryHealth: Number(editForm.batteryHealth ?? editingLaptop.batteryHealth),
      batteryNote: editForm.batteryNote || editingLaptop.batteryNote,
      specs: {
        cpu: editForm.specs?.cpu || editingLaptop.specs.cpu,
        ram: editForm.specs?.ram || editingLaptop.specs.ram,
        storage: editForm.specs?.storage || editingLaptop.specs.storage,
        screen: editForm.specs?.screen || editingLaptop.specs.screen,
        graphics: editForm.specs?.graphics || editingLaptop.specs.graphics
      },
      image: primaryImg,
      additionalImages: allImgs,
      stockCount: Number(editForm.stockCount ?? editingLaptop.stockCount),
      useCategory: editForm.useCategory || editingLaptop.useCategory,
      description: editForm.description || editingLaptop.description,
      serialNumber: editForm.serialNumber || editingLaptop.serialNumber,
      inspectionPassed: editForm.inspectionPassed ?? editingLaptop.inspectionPassed,
      isForSale: editForm.isForSale ?? editingLaptop.isForSale
    };

    try {
      setIsSubmitting(true);
      await saveLaptopToFirestore(updatedLaptop);
      const updatedList = laptops.map((l) => (l.id === updatedLaptop.id ? updatedLaptop : l));
      onUpdateLaptops(updatedList);
      triggerNotification(`Updated & synced ${updatedLaptop.name} images in Firestore database!`);
      setEditingLaptop(null);
    } catch (err) {
      console.error('Error updating laptop:', err);
      triggerNotification('Failed to update laptop in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Notification
  const [notification, setNotification] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const fallbackImage = defaultImages[formBrand as keyof typeof defaultImages] || defaultImages.Dell;
    const primaryImage = formImages.length > 0 ? formImages[0] : fallbackImage;
    const allImagesList = formImages.length > 0 ? formImages : [fallbackImage];

    const newLaptop: Laptop = {
      id: `lap-${Date.now()}`,
      name: formName,
      brand: formBrand,
      year: new Date().getFullYear(),
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
      image: primaryImage,
      additionalImages: allImagesList,
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
      setFormImages([]);
      setFileName('');
      setDriveLinkInput('');
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
            <span className="font-mono text-[10px] text-[#FF3B30] uppercase tracking-widest font-bold flex items-center justify-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Restricted Administration</span>
            </span>
            <h2 className="font-display font-black text-2xl text-[#111111] tracking-tight mt-1.5">
              Rightware Admin
            </h2>
            <p className="font-sans text-xs text-[#6B6B6B] mt-1.5 leading-relaxed">
              Sign in with your email or authorized Google Account (Gmail) to access store administration.
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 text-xs flex flex-col space-y-2 mb-6 leading-relaxed">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
              {loginError.includes('Unauthorized Domain') && (
                <div className="mt-2 pt-2 border-t border-red-200/80 font-sans text-[11px] text-red-900 space-y-2">
                  <p className="font-bold">How to fix in Firebase Console:</p>
                  <ol className="list-decimal list-inside space-y-1 text-red-800">
                    <li>Open <strong>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</strong>.</li>
                    <li>Click <strong>Add domain</strong> and add this domain:</li>
                  </ol>
                  <div className="flex items-center space-x-2 bg-white border border-red-300 p-1.5 font-mono text-[10px] text-neutral-800">
                    <span className="truncate flex-1">{window.location.hostname}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.hostname);
                        alert('Domain copied to clipboard!');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer"
                    >
                      Copy Domain
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Login / Sign Up Tabs */}
          <div className="flex border-b border-[#E5E5E5] mb-5 font-mono text-xs">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setLoginError(''); }}
              className={`flex-1 py-2 font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'border-b-2 border-[#FF3B30] text-[#111111] bg-neutral-50/80'
                  : 'text-[#6B6B6B] hover:text-[#111111]'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setLoginError(''); }}
              className={`flex-1 py-2 font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                authMode === 'signup'
                  ? 'border-b-2 border-[#FF3B30] text-[#111111] bg-neutral-50/80'
                  : 'text-[#6B6B6B] hover:text-[#111111]'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Email & Password Input Form */}
          <form onSubmit={handleEmailAuthSubmit} className="space-y-4 mb-5">
            <div>
              <label className="block font-mono text-[10px] text-neutral-600 uppercase tracking-wider mb-1 font-bold flex items-center space-x-1">
                <Mail className="h-3 w-3 text-[#FF3B30]" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="idelijah0@gmail.com"
                className="w-full bg-white border border-[#CBD5E1] px-3.5 py-2.5 font-sans text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] text-neutral-600 uppercase tracking-wider mb-1 font-bold flex items-center space-x-1">
                <Lock className="h-3 w-3 text-[#FF3B30]" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  className="w-full bg-white border border-[#CBD5E1] px-3.5 py-2.5 pr-10 font-sans text-xs text-[#111111] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full bg-[#111111] hover:bg-black text-white font-sans text-xs font-bold py-3 transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
            >
              <span>{isAuthLoading ? 'Authenticating...' : authMode === 'login' ? 'Sign In to Admin' : 'Create Account'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center mb-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono text-gray-400 uppercase tracking-widest">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAuthLoading}
              className="w-full bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-[#CBD5E1] hover:border-[#111111] text-[#1E293B] font-sans text-xs font-bold py-3 px-4 shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isAuthLoading ? 'Connecting to Google...' : 'Sign in with Google (Gmail)'}</span>
            </button>

            <div className="pt-4 border-t border-[#E5E5E5] space-y-2">
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#6B6B6B] uppercase tracking-wider font-bold">
                <UserCheck className="h-3 w-3 text-[#FF3B30]" />
                <span>Authorized Accounts Whitelist</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-[#111111] bg-neutral-50 p-2.5 border border-[#E5E5E5]">
                <li className="flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                  <span>Idelijah0@gmail.com</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                  <span>Oluwagbogoidowu@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF] text-[#111111] font-sans selection:bg-[#FF3B30] selection:text-white py-4 sm:py-8 px-2 sm:px-6 lg:px-8 flex flex-col justify-between">
      
      {/* Boxed Separate Admin Workspace Container */}
      <div className="max-w-7xl w-full mx-auto bg-white border border-[#D4D4D4] border-t-4 border-t-[#FF3B30] shadow-xl flex flex-col min-h-[85vh]">
        
        {/* Admin Header */}
        <header className="bg-white border-b border-[#E5E5E5] px-4 sm:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            
            <div className="flex items-center space-x-3">
              <div className="bg-[#FF3B30] text-white p-2.5 flex items-center justify-center shadow-xs">
                <Settings className="h-4.5 w-4.5" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-base sm:text-lg tracking-tight text-[#111111] flex items-center space-x-2">
                  <span>Rightware Laptops</span>
                  <span className="font-mono text-[9px] bg-[#111111] text-white px-2 py-0.5 tracking-widest font-black uppercase">
                    ADMIN PORTAL
                  </span>
                </h1>
                <p className="font-mono text-[9px] text-[#6B6B6B] mt-0.5 uppercase tracking-wider">
                  Logged in as <span className="text-[#FF3B30] font-bold">{adminEmail || 'Authorized Administrator'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={onClose}
                className="bg-white hover:bg-neutral-50 active:bg-neutral-100 text-[#111111] font-sans text-xs font-bold px-4 py-2.5 border border-[#CBD5E1] transition-colors cursor-pointer flex items-center space-x-2 shadow-2xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Storefront</span>
              </button>

              <button
                onClick={handleLogout}
                className="bg-[#111111] hover:bg-black text-white font-sans text-xs font-bold px-4 py-2.5 transition-colors cursor-pointer flex items-center space-x-2 shadow-2xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>

          </div>
        </header>

        {/* Main Admin Dashboard Workspace */}
        <main className="flex-grow p-4 sm:p-8">
          
          {/* Success Notifications Overlay */}
          {notification && (
            <div className="fixed bottom-8 right-8 z-50 bg-[#111111] text-white border-l-4 border-[#FF3B30] p-4 shadow-xl font-sans text-xs flex items-center justify-between space-x-4 max-w-md animate-slide-in">
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
                        {formatNaira(laptop.price)}
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
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleStartEdit(laptop)}
                            className="p-1.5 text-neutral-600 hover:text-[#FF3B30] hover:bg-neutral-100 border border-neutral-200 rounded-none cursor-pointer transition-all"
                            title="Edit listing & images stored in database"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLaptop(laptop.id)}
                            className="p-1.5 text-neutral-400 hover:text-[#FF3B30] border border-transparent hover:border-red-100 rounded-none cursor-pointer transition-all"
                            title="Delete product listing"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
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

                <div>
                  <CustomSelect
                    label="Brand"
                    required
                    value={formBrand}
                    options={BRAND_OPTIONS}
                    onChange={setFormBrand}
                    placeholder="-- Select Brand --"
                    customPlaceholder="Type custom brand name..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Our Price (₦ NGN) *
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
                      Original Price (₦ NGN)
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
                    <CustomSelect
                      label="Primary Use Case"
                      required
                      value={formCategory}
                      options={USE_CASE_OPTIONS}
                      onChange={setFormCategory}
                      placeholder="-- Select Primary Use Case --"
                      customPlaceholder="Type custom use case..."
                    />
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
                    <CustomSelect
                      label="Condition"
                      required
                      value={formCondition}
                      options={['Very Clean', 'Clean', 'Good']}
                      onChange={(val) => setFormCondition(val as LaptopCondition)}
                      placeholder="Select condition"
                      allowCustom={false}
                    />
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-sans text-xs font-bold text-neutral-700">
                      Laptop Images ({formImages.length})
                    </label>
                    <span className="font-mono text-[10px] text-neutral-400">
                      Select 1 or multiple images
                    </span>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex border border-[#E5E5E5] p-0.5 bg-neutral-50 mb-2">
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('file')}
                      className={`flex-1 py-1.5 px-2 font-mono text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                        imageSourceMode === 'file'
                          ? 'bg-white text-[#111111] shadow-2xs border border-[#E5E5E5]'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      <Upload className="h-3.5 w-3.5 text-[#FF3B30]" />
                      <span>Pick from My Files</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('drive')}
                      className={`flex-1 py-1.5 px-2 font-mono text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                        imageSourceMode === 'drive'
                          ? 'bg-white text-[#111111] shadow-2xs border border-[#E5E5E5]'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      <HardDrive className="h-3.5 w-3.5 text-blue-600" />
                      <span>Google Drive / Web Link</span>
                    </button>
                  </div>

                  {/* Mode 1: File Upload */}
                  {imageSourceMode === 'file' && (
                    <div className="space-y-1.5">
                      <div className="relative border-2 border-dashed border-[#CBD5E1] hover:border-[#111111] transition-colors p-3.5 text-center bg-white cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Upload className="h-4 w-4 text-[#FF3B30]" />
                          </div>
                          <div>
                            <p className="font-sans text-xs font-bold text-[#111111]">
                              Click or Drag & Drop Image Files
                            </p>
                            <p className="font-mono text-[10px] text-neutral-400 mt-0.5">
                              Hold Ctrl/Cmd or Shift to select multiple files (Max 8MB each)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Google Drive / Web Link */}
                  {imageSourceMode === 'drive' && (
                    <div className="space-y-1.5">
                      <div className="flex space-x-2">
                        <input
                          type="url"
                          value={driveLinkInput}
                          onChange={(e) => setDriveLinkInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddDriveUrl();
                            }
                          }}
                          placeholder="Paste Google Drive link or image URL..."
                          className="flex-1 bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                        />
                        <button
                          type="button"
                          onClick={handleAddDriveUrl}
                          className="px-3.5 py-2 bg-[#111111] hover:bg-[#222222] text-white font-mono text-xs font-bold flex items-center space-x-1.5 cursor-pointer shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Image</span>
                        </button>
                      </div>
                      <p className="font-mono text-[10px] text-neutral-500 bg-neutral-50 p-2 border border-neutral-200 leading-tight flex items-center justify-between">
                        <span>💡 Paste Google Drive share links (set to "Anyone with the link"). You can add multiple links!</span>
                        <a
                          href="https://drive.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 px-1.5 py-0.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-[9px] font-bold inline-flex items-center space-x-0.5 border border-neutral-300"
                        >
                          <span>Drive</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </p>
                    </div>
                  )}

                  {/* Selected Images Gallery */}
                  {formImages.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                          Selected Images ({formImages.length}) — First image is Primary Photo
                        </span>
                        {formImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormImages([])}
                            className="font-mono text-[10px] text-red-600 hover:underline cursor-pointer"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {formImages.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className={`relative border p-1.5 bg-white flex flex-col justify-between transition-all ${
                              idx === 0
                                ? 'border-[#FF3B30] ring-1 ring-[#FF3B30]/30 shadow-xs'
                                : 'border-[#E5E5E5] hover:border-neutral-400'
                            }`}
                          >
                            <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden mb-1.5 border border-neutral-200">
                              <img
                                src={imgUrl}
                                alt={`Laptop photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              {idx === 0 && (
                                <span className="absolute top-1 left-1 bg-[#FF3B30] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 shadow-xs flex items-center space-x-1">
                                  <Star className="h-2.5 w-2.5 fill-white" />
                                  <span>Primary</span>
                                </span>
                              )}
                              <span className="absolute bottom-1 right-1 bg-black/70 text-white font-mono text-[9px] px-1 py-0.5 rounded-none">
                                #{idx + 1}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                              {idx > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleMakePrimaryImage(idx)}
                                  className="text-[9px] font-mono font-bold text-neutral-700 hover:text-[#FF3B30] underline cursor-pointer"
                                  title="Set as main thumbnail image"
                                >
                                  Make Primary
                                </button>
                              ) : (
                                <span className="text-[9px] font-mono text-emerald-600 font-bold">
                                  Main Thumbnail
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                                title="Remove this image"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-[10px] font-mono text-neutral-400 bg-neutral-50 p-2 border border-dashed border-[#E5E5E5] text-center">
                      ℹ️ No images uploaded yet. You can select multiple image files or add multiple Google Drive links. If left blank, a default brand image will be used.
                    </div>
                  )}
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
                    <CustomSelect
                      label="RAM Size"
                      required
                      value={formRam}
                      options={RAM_OPTIONS}
                      onChange={setFormRam}
                      placeholder="-- Select RAM --"
                      customPlaceholder="Type custom RAM size..."
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label="SSD / Storage"
                      required
                      value={formStorage}
                      options={STORAGE_OPTIONS}
                      onChange={setFormStorage}
                      placeholder="-- Select Storage --"
                      customPlaceholder="Type custom storage size..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <CustomSelect
                      label="Screen Display"
                      required
                      value={formScreen}
                      options={SCREEN_OPTIONS}
                      onChange={setFormScreen}
                      placeholder="-- Select Screen Display --"
                      customPlaceholder="Type custom display specification..."
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label="Graphics Card"
                      required
                      value={formGraphics}
                      options={ALL_PRESET_GPUS}
                      onChange={setFormGraphics}
                      placeholder="-- Select Graphics Card --"
                      customPlaceholder="Type custom graphics card..."
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
                      {formatNaira(laptop.price)}
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

        {/* EDIT LAPTOP MODAL */}
        {editingLaptop && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-[#111111] max-w-4xl w-full my-8 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative shadow-2xl">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#E5E5E5] pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-[#FF3B30] uppercase font-bold tracking-widest flex items-center space-x-1">
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Editing Listing & Database Images</span>
                    </span>
                    <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-mono text-[9px] font-bold">
                      <Database className="h-3 w-3 text-emerald-600" />
                      <span>Firestore Sync</span>
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-lg text-[#111111] mt-1">
                    {editingLaptop.name}
                  </h2>
                  <p className="font-mono text-[11px] text-neutral-500 mt-0.5">
                    S/N: {editingLaptop.serialNumber} • ID: {editingLaptop.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingLaptop(null)}
                  className="p-2 text-neutral-400 hover:text-[#111111] hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditLaptop} className="space-y-6">
                
                {/* Section 1: Core details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF9F9] p-4 border border-[#E5E5E5]">
                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Model Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label="Brand"
                      required
                      value={editForm.brand || 'Apple'}
                      options={BRAND_OPTIONS}
                      onChange={(val) => setEditForm((prev) => ({ ...prev, brand: val }))}
                      placeholder="-- Select Brand --"
                      customPlaceholder="Type custom brand name..."
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Selling Price (₦) *
                    </label>
                    <input
                      type="number"
                      required
                      value={editForm.price ?? 0}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Original Price / Market Price (₦)
                    </label>
                    <input
                      type="number"
                      value={editForm.originalPrice ?? ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, originalPrice: Number(e.target.value) }))}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label="Condition Grade"
                      required
                      value={editForm.condition || 'Very Clean'}
                      options={['Very Clean', 'Clean', 'Good']}
                      onChange={(val) => setEditForm((prev) => ({ ...prev, condition: val as LaptopCondition }))}
                      placeholder="-- Select Condition --"
                      allowCustom={false}
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label="Primary Use Case"
                      required
                      value={editForm.useCategory || 'Business / Office Work'}
                      options={USE_CASE_OPTIONS}
                      onChange={(val) => setEditForm((prev) => ({ ...prev, useCategory: val }))}
                      placeholder="-- Select Primary Use Case --"
                      customPlaceholder="Type custom use case..."
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Stock Count Remaining *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editForm.stockCount ?? 1}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, stockCount: Number(e.target.value) }))}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                      Serial Number (S/N) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.serialNumber || ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, serialNumber: e.target.value }))}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>
                </div>

                {/* Section 2: Specs */}
                <div className="space-y-3 bg-[#FAF9F9] p-4 border border-[#E5E5E5]">
                  <h3 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider font-bold">
                    Hardware Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-sans text-xs font-bold text-neutral-700 mb-1">
                        CPU Processor *
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.specs?.cpu || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditForm((prev) => ({
                            ...prev,
                            specs: { ...(prev.specs || editForm.specs || { cpu: '', ram: '', storage: '', screen: '', graphics: '' }), cpu: val }
                          }));
                        }}
                        placeholder="e.g. Apple M2 Pro or i7-12700H"
                        className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                      />
                    </div>

                    <div>
                      <CustomSelect
                        label="RAM Size"
                        required
                        value={editForm.specs?.ram || ''}
                        options={RAM_OPTIONS}
                        onChange={(val) => setEditForm((prev) => ({
                          ...prev,
                          specs: { ...(prev.specs || editForm.specs || { cpu: '', ram: '', storage: '', screen: '', graphics: '' }), ram: val }
                        }))}
                        placeholder="-- Select RAM --"
                        customPlaceholder="Type custom RAM size..."
                      />
                    </div>

                    <div>
                      <CustomSelect
                        label="SSD / Storage"
                        required
                        value={editForm.specs?.storage || ''}
                        options={STORAGE_OPTIONS}
                        onChange={(val) => setEditForm((prev) => ({
                          ...prev,
                          specs: { ...(prev.specs || editForm.specs || { cpu: '', ram: '', storage: '', screen: '', graphics: '' }), storage: val }
                        }))}
                        placeholder="-- Select Storage --"
                        customPlaceholder="Type custom storage size..."
                      />
                    </div>

                    <div>
                      <CustomSelect
                        label="Screen Display"
                        required
                        value={editForm.specs?.screen || ''}
                        options={SCREEN_OPTIONS}
                        onChange={(val) => setEditForm((prev) => ({
                          ...prev,
                          specs: { ...(prev.specs || editForm.specs || { cpu: '', ram: '', storage: '', screen: '', graphics: '' }), screen: val }
                        }))}
                        placeholder="-- Select Display --"
                        customPlaceholder="Type custom display specification..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Database Image Manager */}
                <div className="space-y-3 border border-[#E5E5E5] p-4 bg-white">
                  <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
                    <div>
                      <h3 className="font-mono text-[11px] text-[#111111] uppercase tracking-wider font-bold flex items-center space-x-1.5">
                        <Database className="h-3.5 w-3.5 text-[#FF3B30]" />
                        <span>Database Product Images Manager</span>
                      </h3>
                      <p className="font-sans text-[11px] text-neutral-500 mt-0.5">
                        Upload image files directly or paste Google Drive links. All images persist in Firestore!
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-bold">
                      {editImages.length} Image(s) Attached
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Upload Files */}
                    <div className="relative border-2 border-dashed border-[#CBD5E1] hover:border-[#111111] p-3 text-center bg-neutral-50/50 cursor-pointer transition-colors group">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleEditFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <Upload className="h-5 w-5 text-[#FF3B30] group-hover:scale-110 transition-transform" />
                        <span className="font-sans text-xs font-bold text-[#111111]">
                          Click or Drag Image Files
                        </span>
                        <span className="font-mono text-[9px] text-neutral-400">
                          Auto-encoded and stored in database document
                        </span>
                      </div>
                    </div>

                    {/* Drive Link Input */}
                    <div className="space-y-1.5 flex flex-col justify-center bg-neutral-50/50 p-3 border border-[#E5E5E5]">
                      <span className="font-mono text-[10px] text-neutral-600 font-bold uppercase">
                        Or Add Google Drive Share Links
                      </span>
                      <div className="flex space-x-1.5">
                        <input
                          type="url"
                          value={editDriveInput}
                          onChange={(e) => setEditDriveInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddEditDriveUrl();
                            }
                          }}
                          placeholder="Paste Google Drive link..."
                          className="flex-1 bg-white border border-[#E5E5E5] px-2.5 py-1.5 font-sans text-xs text-[#111111]"
                        />
                        <button
                          type="button"
                          onClick={handleAddEditDriveUrl}
                          className="px-3 py-1.5 bg-[#111111] hover:bg-[#222222] text-white font-mono text-xs font-bold shrink-0 cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image Gallery Grid */}
                  {editImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                      {editImages.map((img, idx) => (
                        <div
                          key={idx}
                          className={`relative border p-1.5 bg-white flex flex-col justify-between ${
                            idx === 0 ? 'border-[#FF3B30] ring-1 ring-[#FF3B30]/30' : 'border-[#E5E5E5]'
                          }`}
                        >
                          <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden mb-1 border border-neutral-200">
                            <img
                              src={img}
                              alt={`Product photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {idx === 0 && (
                              <span className="absolute top-1 left-1 bg-[#FF3B30] text-white text-[8px] font-mono font-bold px-1.5 py-0.5 shadow-xs flex items-center space-x-0.5">
                                <Star className="h-2 w-2 fill-white" />
                                <span>Primary</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between space-x-1 text-[9px] font-mono">
                            {idx !== 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const selected = editImages[idx];
                                  const rest = editImages.filter((_, i) => i !== idx);
                                  setEditImages([selected, ...rest]);
                                }}
                                className="text-neutral-700 hover:text-[#FF3B30] underline cursor-pointer"
                              >
                                Set Primary
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-bold">Primary Photo</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setEditImages((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-red-600 hover:text-red-800 p-0.5 cursor-pointer"
                              title="Remove photo"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
                  <button
                    type="button"
                    onClick={() => setEditingLaptop(null)}
                    className="px-4 py-2 border border-[#E5E5E5] hover:bg-neutral-100 font-mono text-xs font-bold text-neutral-700 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#FF3B30] hover:bg-[#D92D20] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Database className="h-4 w-4" />
                    <span>{isSubmitting ? 'Saving to Database...' : 'Save Changes & Sync Database'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </main>

        {/* Footer copyright inside standalone container */}
        <footer className="border-t border-[#E5E5E5] py-5 px-6 text-center font-mono text-[9px] text-neutral-400 bg-neutral-50/50">
          © 2026 Rightware Laptops Staff Portal. All diagnostics and serial records are encrypted.
        </footer>

      </div>
    </div>
  );
}
