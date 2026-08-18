import React, { useState, useEffect } from 'react';
import { CustomSelect, CustomMultiSelect } from './CustomSelect';
import { Laptop, LaptopCondition, LaptopSpecs, Testimonial } from '../types';
import { 
  saveLaptopToFirestore, 
  deleteLaptopFromFirestore, 
  subscribeReservations,
  subscribeTestimonials,
  saveTestimonialToFirestore,
  deleteTestimonialFromFirestore,
  updateTestimonialStatus,
  subscribeDailyViews,
  getTodayDateString
} from '../lib/firebaseService';
import { uploadToCloudinary } from '../lib/cloudinaryService';
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
  Edit3,
  Calendar,
  PhoneCall,
  Clock,
  Quote,
  MessageSquare,
  Sparkles,
  TrendingUp,
  BarChart3,
  Link2,
  Copy,
  Check,
  Layers,
  Filter,
  Activity,
  ArrowUpRight
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

export const STORAGE_TYPE_OPTIONS = [
  'SSD',
  'HDD',
  'NVMe SSD',
  'eMMC',
  'SSHD (Hybrid)'
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

  // Tab state: 'inventory' | 'add' | 'sold' | 'reservations'
  const ADD_DRAFT_KEY = 'rw_admin_add_laptop_draft';
  const EDIT_DRAFT_KEY = 'rw_admin_edit_laptop_draft';
  const TAB_DRAFT_KEY = 'rw_admin_active_tab';

  const getInitialAddDraft = () => {
    try {
      const saved = sessionStorage.getItem(ADD_DRAFT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing add draft:', e);
    }
    return null;
  };

  const getInitialEditDraft = () => {
    try {
      const saved = sessionStorage.getItem(EDIT_DRAFT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing edit draft:', e);
    }
    return null;
  };

  const initialAddDraft = getInitialAddDraft();
  const initialEditDraft = getInitialEditDraft();

  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'sold' | 'reservations' | 'daily-views'>(() => {
    try {
      const savedTab = sessionStorage.getItem(TAB_DRAFT_KEY);
      if (savedTab && ['inventory', 'add', 'sold', 'reservations', 'daily-views'].includes(savedTab)) {
        return savedTab as any;
      }
    } catch (e) {}
    return initialAddDraft ? 'add' : 'inventory';
  });

  const [reservations, setReservations] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [dailyViewsData, setDailyViewsData] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeRes = subscribeReservations((data) => {
      setReservations(data);
    });
    const unsubscribeTesti = subscribeTestimonials((data) => {
      setTestimonials(data);
    });
    const unsubscribeDaily = subscribeDailyViews((data) => {
      setDailyViewsData(data);
    });
    return () => {
      unsubscribeRes();
      unsubscribeTesti();
      unsubscribeDaily();
    };
  }, []);

  // Daily Link Views Filtering State
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'today' | 'yesterday' | '7days' | '14days' | '30days' | 'custom'>('7days');
  const [customDateFilter, setCustomDateFilter] = useState<string>('');
  const [analyticsSearch, setAnalyticsSearch] = useState<string>('');
  const [copiedLinkLaptopId, setCopiedLinkLaptopId] = useState<string | null>(null);

  // Helper date calculations
  const todayDateStr = getTodayDateString();
  const yesterdayDateStr = getTodayDateString(new Date(Date.now() - 86400000));

  const allInventoryAndSold: Laptop[] = [...laptops, ...soldLaptops];

  const getLaptopViewsOnDate = (laptop: Laptop, dateStr: string): number => {
    return laptop.dailyViews?.[dateStr] || 0;
  };

  const getLaptopTodayViews = (laptop: Laptop): number => {
    return getLaptopViewsOnDate(laptop, todayDateStr);
  };

  // Calculate live today total views
  const todayTotalViews = allInventoryAndSold.reduce((acc, l) => acc + getLaptopTodayViews(l), 0);
  const yesterdayTotalViews = allInventoryAndSold.reduce((acc, l) => acc + getLaptopViewsOnDate(l, yesterdayDateStr), 0);
  const overallTotalViews = allInventoryAndSold.reduce((acc, l) => acc + (l.viewCount || 0), 0);

  // Past N days array helpers
  const getPastNDays = (daysCount: number) => {
    const arr: string[] = [];
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(Date.now() - i * 86400000);
      arr.push(getTodayDateString(d));
    }
    return arr;
  };

  const last7DaysArr = getPastNDays(7);
  const last14DaysArr = getPastNDays(14);
  const last30DaysArr = getPastNDays(30);

  const last7DaysTotalViews = allInventoryAndSold.reduce((acc, l) => {
    return acc + last7DaysArr.reduce((sum, d) => sum + getLaptopViewsOnDate(l, d), 0);
  }, 0);

  const last30DaysTotalViews = allInventoryAndSold.reduce((acc, l) => {
    return acc + last30DaysArr.reduce((sum, d) => sum + getLaptopViewsOnDate(l, d), 0);
  }, 0);

  const handleCopyDirectLink = (laptopId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?laptop=${laptopId}`;
    navigator.clipboard.writeText(url);
    setCopiedLinkLaptopId(laptopId);
    triggerNotification(`Copied share link: ${url}`);
    setTimeout(() => setCopiedLinkLaptopId(null), 2500);
  };

  // Testimonial Modal & Form State
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [testiName, setTestiName] = useState('');
  const [testiRole, setTestiRole] = useState('Verified Client');
  const [testiQuote, setTestiQuote] = useState('');
  const [testiRating, setTestiRating] = useState<number>(5);
  const [testiAvatar, setTestiAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
  const [testiVerified, setTestiVerified] = useState(true);
  const [testiLaptopBought, setTestiLaptopBought] = useState('');
  const [testiSoldLaptopId, setTestiSoldLaptopId] = useState('');
  const [testiIsLive, setTestiIsLive] = useState(true);
  const [testiStatus, setTestiStatus] = useState<'approved' | 'pending' | 'hidden'>('approved');
  const [testiSubmittedByCustomer, setTestiSubmittedByCustomer] = useState(false);
  const [testiCustomerPhone, setTestiCustomerPhone] = useState('');
  const [testiCustomerEmail, setTestiCustomerEmail] = useState('');
  const [testiCreatedAt, setTestiCreatedAt] = useState<number | undefined>(undefined);

  // Sold Laptop Review Modal / Inline Editor State
  const [editingSoldLaptop, setEditingSoldLaptop] = useState<Laptop | null>(null);
  const [editBuyerName, setEditBuyerName] = useState('');
  const [editBuyerFeedback, setEditBuyerFeedback] = useState('');
  const [editDeliveredDate, setEditDeliveredDate] = useState('');

  const handleOpenAddTestimonial = (soldLaptop?: Laptop) => {
    if (soldLaptop) {
      setEditingTestimonialId(null);
      setTestiName(soldLaptop.buyerName || 'Verified Client');
      setTestiRole('Verified Buyer, Lagos');
      setTestiQuote(soldLaptop.buyerFeedback || '');
      setTestiRating(5);
      setTestiAvatar(soldLaptop.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
      setTestiVerified(true);
      setTestiLaptopBought(soldLaptop.name);
      setTestiSoldLaptopId(soldLaptop.id);
      setTestiIsLive(true);
      setTestiStatus('approved');
      setTestiSubmittedByCustomer(false);
      setTestiCustomerPhone('');
      setTestiCustomerEmail('');
      setTestiCreatedAt(Date.now());
    } else {
      setEditingTestimonialId(null);
      setTestiName('');
      setTestiRole('Verified Buyer');
      setTestiQuote('');
      setTestiRating(5);
      setTestiAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
      setTestiVerified(true);
      setTestiLaptopBought('');
      setTestiSoldLaptopId('');
      setTestiIsLive(true);
      setTestiStatus('approved');
      setTestiSubmittedByCustomer(false);
      setTestiCustomerPhone('');
      setTestiCustomerEmail('');
      setTestiCreatedAt(Date.now());
    }
    setIsTestimonialModalOpen(true);
  };

  const handleOpenEditTestimonial = (t: Testimonial) => {
    setEditingTestimonialId(t.id);
    setTestiName(t.name);
    setTestiRole(t.role);
    setTestiQuote(t.quote);
    setTestiRating(t.rating || 5);
    setTestiAvatar(t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
    setTestiVerified(t.verifiedPurchase);
    setTestiLaptopBought(t.laptopBought);
    setTestiSoldLaptopId(t.soldLaptopId || '');
    setTestiIsLive(t.isLive !== false && t.status !== 'pending' && t.status !== 'hidden');
    setTestiStatus(t.status || (t.isLive === false ? 'pending' : 'approved'));
    setTestiSubmittedByCustomer(!!t.submittedByCustomer);
    setTestiCustomerPhone(t.customerPhone || '');
    setTestiCustomerEmail(t.customerEmail || '');
    setTestiCreatedAt(t.createdAt);
    setIsTestimonialModalOpen(true);
  };

  const handleSelectSoldLaptopForTestimonial = (soldId: string) => {
    setTestiSoldLaptopId(soldId);
    if (!soldId) return;
    const found = soldLaptops.find(s => s.id === soldId);
    if (found) {
      setTestiLaptopBought(found.name);
      if (!testiName && found.buyerName) setTestiName(found.buyerName);
      if (!testiQuote && found.buyerFeedback) setTestiQuote(found.buyerFeedback);
      if (found.image) setTestiAvatar(found.image);
    }
  };

  const handleSaveTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testiName.trim() || !testiQuote.trim()) {
      setNotification({ type: 'error', message: 'Please enter both client name and review quote.' });
      return;
    }

    const finalStatus: 'approved' | 'pending' | 'hidden' = testiIsLive ? 'approved' : (testiStatus === 'pending' ? 'pending' : 'hidden');

    const newOrUpdatedTestimonial: Testimonial = {
      id: editingTestimonialId || `testimonial_${Date.now()}`,
      name: testiName.trim(),
      role: testiRole.trim() || 'Verified Buyer',
      quote: testiQuote.trim(),
      rating: testiRating,
      avatar: testiAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      verifiedPurchase: testiVerified,
      laptopBought: testiLaptopBought.trim() || 'Workstation Laptop',
      soldLaptopId: testiSoldLaptopId || undefined,
      isLive: testiIsLive,
      status: finalStatus,
      submittedByCustomer: testiSubmittedByCustomer,
      customerPhone: testiCustomerPhone.trim() || undefined,
      customerEmail: testiCustomerEmail.trim() || undefined,
      createdAt: testiCreatedAt || Date.now()
    };

    try {
      await saveTestimonialToFirestore(newOrUpdatedTestimonial);

      // If connected to a sold laptop, update the buyer name & feedback on that sold laptop doc in Firestore
      if (testiSoldLaptopId) {
        const found = soldLaptops.find(s => s.id === testiSoldLaptopId);
        if (found) {
          const updatedSoldDoc: Laptop = {
            ...found,
            buyerName: testiName.trim(),
            buyerFeedback: testiQuote.trim(),
          };
          await saveLaptopToFirestore(updatedSoldDoc);
        }
      }

      setNotification({
        type: 'success',
        message: editingTestimonialId 
          ? (testiIsLive ? 'Testimonial updated & live on homepage!' : 'Testimonial updated and saved in archive.') 
          : (testiIsLive ? 'New testimonial published to homepage!' : 'Testimonial saved in archive.')
      });
      setIsTestimonialModalOpen(false);
    } catch (err: any) {
      console.error('Error saving testimonial:', err);
      setNotification({ type: 'error', message: 'Failed to save testimonial: ' + err.message });
    }
  };

  // Quick Approve and Make Live from Pending Queue
  const handleApproveAndMakeLive = async (testimonial: Testimonial) => {
    try {
      await updateTestimonialStatus(testimonial.id, true, 'approved');
      triggerNotification(`Review by ${testimonial.name} approved & published LIVE on homepage!`);
    } catch (err: any) {
      console.error('Error approving review:', err);
      setNotification({ type: 'error', message: 'Failed to approve review: ' + err.message });
    }
  };

  // Quick Toggle Live / Offline
  const handleToggleTestimonialLiveStatus = async (testimonial: Testimonial) => {
    const currentlyLive = testimonial.isLive !== false && testimonial.status !== 'pending' && testimonial.status !== 'hidden';
    const willBeLive = !currentlyLive;
    const newStatus = willBeLive ? 'approved' : 'hidden';

    try {
      await updateTestimonialStatus(testimonial.id, willBeLive, newStatus);
      triggerNotification(
        willBeLive 
          ? `Testimonial by ${testimonial.name} is now LIVE on homepage!` 
          : `Testimonial by ${testimonial.name} taken offline (hidden).`
      );
    } catch (err: any) {
      console.error('Error toggling live status:', err);
      setNotification({ type: 'error', message: 'Failed to update status: ' + err.message });
    }
  };

  const handleDeleteTestimonialClick = async (testimonialId: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await deleteTestimonialFromFirestore(testimonialId);
      setNotification({ type: 'success', message: 'Testimonial deleted from database.' });
    } catch (err: any) {
      console.error('Error deleting testimonial:', err);
      setNotification({ type: 'error', message: 'Failed to remove testimonial.' });
    }
  };

  const handleStartEditSoldLaptop = (laptop: Laptop) => {
    setEditingSoldLaptop(laptop);
    setEditBuyerName(laptop.buyerName || '');
    setEditBuyerFeedback(laptop.buyerFeedback || '');
    setEditDeliveredDate(laptop.deliveredDate || 'DELIVERED');
  };

  const handleSaveSoldLaptopReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSoldLaptop) return;

    const updatedSold: Laptop = {
      ...editingSoldLaptop,
      buyerName: editBuyerName.trim() || 'Verified Client',
      buyerFeedback: editBuyerFeedback.trim(),
      deliveredDate: editDeliveredDate.trim() || 'DELIVERED'
    };

    try {
      await saveLaptopToFirestore(updatedSold);
      setNotification({ type: 'success', message: 'Sold laptop record updated successfully.' });
      setEditingSoldLaptop(null);
    } catch (err: any) {
      console.error('Error updating sold laptop:', err);
      setNotification({ type: 'error', message: 'Failed to update sold laptop record.' });
    }
  };

  // New Laptop Form State (Restored from draft if available)
  const [formName, setFormName] = useState(initialAddDraft?.formName ?? '');
  const [formBrand, setFormBrand] = useState(initialAddDraft?.formBrand ?? 'Apple');
  const [formPrice, setFormPrice] = useState(initialAddDraft?.formPrice ?? 600);
  const [formOriginalPrice, setFormOriginalPrice] = useState(initialAddDraft?.formOriginalPrice ?? 1200);
  const [formCondition, setFormCondition] = useState<LaptopCondition>(initialAddDraft?.formCondition ?? 'Very Clean');
  const [formBatteryHealth, setFormBatteryHealth] = useState(initialAddDraft?.formBatteryHealth ?? 90);
  const [formBatteryNote, setFormBatteryNote] = useState(initialAddDraft?.formBatteryNote ?? '90% Health • Checked & Excellent');
  const [formCpu, setFormCpu] = useState(initialAddDraft?.formCpu ?? '');
  const [formRam, setFormRam] = useState(initialAddDraft?.formRam ?? '16GB');
  const [formStorage, setFormStorage] = useState(initialAddDraft?.formStorage ?? '512GB');
  const [formStorageType, setFormStorageType] = useState(initialAddDraft?.formStorageType ?? 'SSD');
  const [formScreen, setFormScreen] = useState(initialAddDraft?.formScreen ?? '14" Retina Display');
  const [formGraphics, setFormGraphics] = useState(initialAddDraft?.formGraphics ?? 'Intel Iris Xe Graphics');
  const [formImages, setFormImages] = useState<string[]>(initialAddDraft?.formImages ?? []);
  const [imageSourceMode, setImageSourceMode] = useState<'file' | 'drive'>(initialAddDraft?.imageSourceMode ?? 'file');
  const [fileName, setFileName] = useState<string>('');
  const [driveLinkInput, setDriveLinkInput] = useState<string>(initialAddDraft?.driveLinkInput ?? '');

  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files) as File[];
    setIsUploadingImage(true);
    triggerNotification(`Uploading ${filesArray.length} image(s) securely to Cloudinary...`);

    const uploadedUrls: string[] = [];
    const prefix = formSerial ? formSerial.replace(/[^a-zA-Z0-9_-]/g, '_') : 'new';

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      if (file.size > 15 * 1024 * 1024) {
        triggerNotification(`Skipped ${file.name}: Exceeds 15MB limit.`);
        continue;
      }
      try {
        const publicId = `laptop_${prefix}_${Date.now()}_${i + 1}`;
        const cloudinaryUrl = await uploadToCloudinary(file, {
          folder: 'rightware_laptops',
          publicId
        });
        uploadedUrls.push(cloudinaryUrl);
      } catch (err: any) {
        console.error('Cloudinary upload error:', err);
        triggerNotification(`Error uploading ${file.name}: ${err.message || 'Upload failed'}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setFormImages((prev) => [...prev, ...uploadedUrls]);
      triggerNotification(`Cloudinary upload complete! Optimized & added ${uploadedUrls.length} image(s).`);
    }

    setIsUploadingImage(false);
    e.target.value = '';
  };

  const getDuplicateImageWarning = (inputUrl: string, currentImagesList: string[], excludeLaptopId?: string) => {
    if (!inputUrl.trim()) return null;
    const rawInput = inputUrl.trim();
    const links = rawInput.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);

    for (const rawLink of links) {
      const converted = convertGoogleDriveUrl(rawLink);
      // Check if already in current list
      if (currentImagesList.some((img) => img === converted || img === rawLink)) {
        return 'This image URL is already in the selected list for this laptop!';
      }
      // Check across existing inventory laptops
      const existingLaptop = laptops.find(
        (l) =>
          l.id !== excludeLaptopId &&
          (l.image === converted ||
            l.image === rawLink ||
            l.additionalImages?.includes(converted) ||
            l.additionalImages?.includes(rawLink))
      );
      if (existingLaptop) {
        return `This image URL is already in use by laptop "${existingLaptop.name}" (${existingLaptop.serialNumber || existingLaptop.brand}).`;
      }
    }
    return null;
  };

  const handleAddDriveUrl = () => {
    if (!driveLinkInput.trim()) return;
    const rawInput = driveLinkInput.trim();
    const links = rawInput.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    const convertedLinks = links.map(convertGoogleDriveUrl);

    const duplicates: string[] = [];
    const uniqueLinks: string[] = [];

    for (const link of convertedLinks) {
      const isAlreadyInCurrent = formImages.includes(link);
      const isAlreadyInStore = laptops.some(
        (l) => l.image === link || l.additionalImages?.includes(link)
      );

      if (isAlreadyInCurrent || isAlreadyInStore) {
        duplicates.push(link);
      } else {
        uniqueLinks.push(link);
      }
    }

    if (duplicates.length > 0) {
      triggerNotification(`⚠️ Duplication Alert: Skipped ${duplicates.length} duplicate image URL(s) already in use.`);
    }

    if (uniqueLinks.length > 0) {
      setFormImages((prev) => [...prev, ...uniqueLinks]);
      setDriveLinkInput('');
      triggerNotification(`Added ${uniqueLinks.length} new Google Drive/Web image(s).`);
    } else if (duplicates.length > 0) {
      setDriveLinkInput('');
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
  const [formStock, setFormStock] = useState(initialAddDraft?.formStock ?? 1);
  const [formCategory, setFormCategory] = useState<string>(initialAddDraft?.formCategory ?? 'Business / Office Work');
  const [formDescription, setFormDescription] = useState(initialAddDraft?.formDescription ?? '');
  const [formSerial, setFormSerial] = useState(initialAddDraft?.formSerial ?? '');
  const [formInspection, setFormInspection] = useState(initialAddDraft?.formInspection ?? true);
  const [formForSale, setFormForSale] = useState(initialAddDraft?.formForSale ?? true);

  // Edit Laptop Modal State (Restored from edit draft if available)
  const [editingLaptop, setEditingLaptop] = useState<Laptop | null>(initialEditDraft?.editingLaptop ?? null);
  const [editForm, setEditForm] = useState<Partial<Laptop>>(initialEditDraft?.editForm ?? {});
  const [editImages, setEditImages] = useState<string[]>(initialEditDraft?.editImages ?? []);
  const [editDriveInput, setEditDriveInput] = useState<string>(initialEditDraft?.editDriveInput ?? '');

  // Clear Add Draft helper
  const clearAddDraft = () => {
    try {
      sessionStorage.removeItem(ADD_DRAFT_KEY);
    } catch (e) {}
    setFormName('');
    setFormBrand('Apple');
    setFormPrice(600);
    setFormOriginalPrice(1200);
    setFormCondition('Very Clean');
    setFormBatteryHealth(90);
    setFormBatteryNote('90% Health • Checked & Excellent');
    setFormCpu('');
    setFormRam('16GB');
    setFormStorage('512GB');
    setFormStorageType('SSD');
    setFormScreen('14" Retina Display');
    setFormGraphics('Intel Iris Xe Graphics');
    setFormImages([]);
    setImageSourceMode('file');
    setFileName('');
    setDriveLinkInput('');
    setFormStock(1);
    setFormCategory('Business / Office Work');
    setFormDescription('');
    setFormSerial('');
    setFormInspection(true);
    setFormForSale(true);
  };

  // Clear Edit Draft helper
  const clearEditDraft = () => {
    try {
      sessionStorage.removeItem(EDIT_DRAFT_KEY);
    } catch (e) {}
    setEditingLaptop(null);
    setEditForm({});
    setEditImages([]);
    setEditDriveInput('');
  };

  // Sync activeTab to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(TAB_DRAFT_KEY, activeTab);
    } catch (e) {}
  }, [activeTab]);

  // Sync Add Laptop Form Draft to sessionStorage
  useEffect(() => {
    const hasUserInputs =
      formName.trim() !== '' ||
      formCpu.trim() !== '' ||
      formSerial.trim() !== '' ||
      formDescription.trim() !== '' ||
      driveLinkInput.trim() !== '' ||
      formImages.length > 0;

    if (hasUserInputs) {
      const draft = {
        formName,
        formBrand,
        formPrice,
        formOriginalPrice,
        formCondition,
        formBatteryHealth,
        formBatteryNote,
        formCpu,
        formRam,
        formStorage,
        formStorageType,
        formScreen,
        formGraphics,
        formImages,
        imageSourceMode,
        driveLinkInput,
        formStock,
        formCategory,
        formDescription,
        formSerial,
        formInspection,
        formForSale
      };
      try {
        sessionStorage.setItem(ADD_DRAFT_KEY, JSON.stringify(draft));
      } catch (e) {}
    } else {
      try {
        sessionStorage.removeItem(ADD_DRAFT_KEY);
      } catch (e) {}
    }
  }, [
    formName,
    formBrand,
    formPrice,
    formOriginalPrice,
    formCondition,
    formBatteryHealth,
    formBatteryNote,
    formCpu,
    formRam,
    formStorage,
    formStorageType,
    formScreen,
    formGraphics,
    formImages,
    imageSourceMode,
    driveLinkInput,
    formStock,
    formCategory,
    formDescription,
    formSerial,
    formInspection,
    formForSale
  ]);

  // Sync Edit Laptop Modal Draft to sessionStorage
  useEffect(() => {
    if (editingLaptop) {
      const editDraft = {
        editingLaptop,
        editForm,
        editImages,
        editDriveInput
      };
      try {
        sessionStorage.setItem(EDIT_DRAFT_KEY, JSON.stringify(editDraft));
      } catch (e) {}
    } else {
      try {
        sessionStorage.removeItem(EDIT_DRAFT_KEY);
      } catch (e) {}
    }
  }, [editingLaptop, editForm, editImages, editDriveInput]);

  const handleStartEdit = (laptop: Laptop) => {
    setEditingLaptop(laptop);
    setEditForm({ ...laptop });
    const existingImgs = laptop.additionalImages?.length ? laptop.additionalImages : (laptop.image ? [laptop.image] : []);
    setEditImages(existingImgs);
    setEditDriveInput('');
  };

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingLaptop) return;

    const filesArray = Array.from(files) as File[];
    setIsUploadingImage(true);
    triggerNotification(`Uploading ${filesArray.length} image(s) to Cloudinary...`);

    const uploadedUrls: string[] = [];
    const prefix = editingLaptop.serialNumber ? editingLaptop.serialNumber.replace(/[^a-zA-Z0-9_-]/g, '_') : editingLaptop.id;

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      if (file.size > 15 * 1024 * 1024) {
        triggerNotification(`Skipped ${file.name}: Exceeds 15MB limit.`);
        continue;
      }
      try {
        const publicId = `laptop_${prefix}_${Date.now()}_${i + 1}`;
        const cloudinaryUrl = await uploadToCloudinary(file, {
          folder: 'rightware_laptops',
          publicId
        });
        uploadedUrls.push(cloudinaryUrl);
      } catch (err: any) {
        console.error('Cloudinary upload error:', err);
        triggerNotification(`Error uploading ${file.name}: ${err.message || 'Upload failed'}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setEditImages((prev) => [...prev, ...uploadedUrls]);
      triggerNotification(`Cloudinary upload complete! Added ${uploadedUrls.length} image(s).`);
    }

    setIsUploadingImage(false);
    e.target.value = '';
  };

  const handleAddEditDriveUrl = () => {
    if (!editDriveInput.trim()) return;
    const rawInput = editDriveInput.trim();
    const links = rawInput.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    const convertedLinks = links.map(convertGoogleDriveUrl);

    const duplicates: string[] = [];
    const uniqueLinks: string[] = [];

    for (const link of convertedLinks) {
      const isAlreadyInCurrent = editImages.includes(link);
      const isAlreadyInStore = laptops.some(
        (l) => l.id !== editingLaptop?.id && (l.image === link || l.additionalImages?.includes(link))
      );

      if (isAlreadyInCurrent || isAlreadyInStore) {
        duplicates.push(link);
      } else {
        uniqueLinks.push(link);
      }
    }

    if (duplicates.length > 0) {
      triggerNotification(`⚠️ Duplication Alert: Skipped ${duplicates.length} duplicate image URL(s) already in use.`);
    }

    if (uniqueLinks.length > 0) {
      setEditImages((prev) => [...prev, ...uniqueLinks]);
      setEditDriveInput('');
      triggerNotification(`Added ${uniqueLinks.length} new image link(s).`);
    } else if (duplicates.length > 0) {
      setEditDriveInput('');
    }
  };

  const handleSaveEditLaptop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLaptop) return;

    setIsSubmitting(true);
    triggerNotification('Processing and optimizing laptop images on Cloudinary...');

    // Cloudinary processing for edit images
    const processedEditImages: string[] = [];
    const prefix = (editForm.serialNumber || editingLaptop.serialNumber || editingLaptop.id).replace(/[^a-zA-Z0-9_-]/g, '_');

    for (let i = 0; i < editImages.length; i++) {
      const img = editImages[i];
      if (img.startsWith('data:image/')) {
        try {
          const publicId = `laptop_${prefix}_${Date.now()}_${i + 1}`;
          const cUrl = await uploadToCloudinary(img, {
            folder: 'rightware_laptops',
            publicId
          });
          processedEditImages.push(cUrl);
        } catch (err) {
          console.warn('Could not upload base64 image to Cloudinary:', err);
          processedEditImages.push(img);
        }
      } else {
        processedEditImages.push(img);
      }
    }

    const defaultImages = {
      Apple: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      Lenovo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      Dell: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
      HP: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    };

    const fallbackImg = defaultImages[(editForm.brand || editingLaptop.brand) as keyof typeof defaultImages] || defaultImages.Dell;
    const primaryImg = processedEditImages.length > 0 ? processedEditImages[0] : fallbackImg;
    const allImgs = processedEditImages.length > 0 ? processedEditImages : [fallbackImg];

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
        storageType: editForm.specs?.storageType ?? editingLaptop.specs.storageType ?? 'SSD',
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
      await saveLaptopToFirestore(updatedLaptop);
      const updatedList = laptops.map((l) => (l.id === updatedLaptop.id ? updatedLaptop : l));
      onUpdateLaptops(updatedList);
      triggerNotification(`Updated & synced ${updatedLaptop.name} Cloudinary images in Firestore!`);
      clearEditDraft();
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
    if (!formName || !formCpu) {
      triggerNotification('Please fill in Model Name and CPU Processor!');
      return;
    }

    setIsSubmitting(true);
    triggerNotification('Uploading & optimizing images via Cloudinary...');

    const generatedSerial = formSerial.trim() || `RW-${(formBrand || 'UNIT').substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Process all images to ensure Cloudinary CDN URLs
    const processedFormImages: string[] = [];
    const prefix = generatedSerial.replace(/[^a-zA-Z0-9_-]/g, '_');

    for (let i = 0; i < formImages.length; i++) {
      const img = formImages[i];
      if (img.startsWith('data:image/')) {
        try {
          const publicId = `laptop_${prefix}_${Date.now()}_${i + 1}`;
          const cUrl = await uploadToCloudinary(img, {
            folder: 'rightware_laptops',
            publicId
          });
          processedFormImages.push(cUrl);
        } catch (err) {
          console.warn('Error uploading base64 image to Cloudinary:', err);
          processedFormImages.push(img);
        }
      } else {
        processedFormImages.push(img);
      }
    }

    const defaultImages = {
      Apple: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      Lenovo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      Dell: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
      HP: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    };

    const fallbackImage = defaultImages[formBrand as keyof typeof defaultImages] || defaultImages.Dell;
    const primaryImage = processedFormImages.length > 0 ? processedFormImages[0] : fallbackImage;
    const allImagesList = processedFormImages.length > 0 ? processedFormImages : [fallbackImage];

    const newLaptop: Laptop = {
      id: `lap-${Date.now()}`,
      createdAt: Date.now(),
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
        storageType: formStorageType,
        screen: formScreen,
        graphics: formGraphics
      },
      image: primaryImage,
      additionalImages: allImagesList,
      stockCount: Number(formStock),
      useCategory: formCategory,
      description: formDescription || `Tested and verified ${formCondition} condition ${formName}. Fully ready for productivity.`,
      serialNumber: generatedSerial,
      inspectionPassed: formInspection,
      isForSale: formForSale
    };

    try {
      await saveLaptopToFirestore(newLaptop);
      const updated = [newLaptop, ...laptops];
      onUpdateLaptops(updated);
      triggerNotification(`Cloudinary images stored in database & listing launched: ${formName}`);
      
      // Reset Form Fields & Clear Draft
      clearAddDraft();
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
    <div className="min-h-screen bg-white text-[#111111] font-sans selection:bg-[#FF3B30] selection:text-white flex flex-col justify-between w-full">
      
      {/* Full Bleed Admin Workspace */}
      <div className="w-full bg-white flex flex-col min-h-screen">
        
        {/* Admin Header */}
        
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
          <div className="bg-white border border-[#E5E5E5] p-3.5 shadow-xs">
            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">Active Inventory</span>
            <span className="font-display font-black text-2xl text-[#111111] mt-1 block">{laptops.length}</span>
            <span className="font-sans text-[10px] text-[#6B6B6B] mt-0.5 block">Verified & cataloged units</span>
          </div>

          <div className="bg-white border border-[#E5E5E5] p-3.5 shadow-xs">
            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">Currently For Sale</span>
            <span className="font-display font-black text-2xl text-[#FF3B30] mt-1 block">
              {laptops.filter(l => l.isForSale !== false).length}
            </span>
            <span className="font-sans text-[10px] text-emerald-600 mt-0.5 block">Listed on client catalog</span>
          </div>

          <div className="bg-white border border-emerald-200 bg-emerald-50/20 p-3.5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-emerald-700 font-bold uppercase tracking-wider block">Today's Link Views</span>
              <span className="font-mono text-[8px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 border border-emerald-300 flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE TODAY</span>
              </span>
            </div>
            <span className="font-display font-black text-2xl text-emerald-900 mt-1 block flex items-center space-x-1.5">
              <span>{todayTotalViews}</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </span>
            <span className="font-sans text-[10px] text-emerald-700 font-medium mt-0.5 block">
              {todayTotalViews === 1 ? '1 visit logged today' : `${todayTotalViews} visits logged today`}
            </span>
          </div>

          <div className="bg-white border border-[#E5E5E5] p-3.5 shadow-xs">
            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">Overall Total Views</span>
            <span className="font-display font-black text-2xl text-[#111111] mt-1 block flex items-center space-x-1.5">
              <span>{overallTotalViews}</span>
              <Eye className="h-4 w-4 text-blue-600" />
            </span>
            <span className="font-sans text-[10px] text-blue-600 mt-0.5 block">All-time direct & catalog visits</span>
          </div>

          <div className="bg-white border border-[#E5E5E5] p-3.5 shadow-xs col-span-2 sm:col-span-1">
            <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">Total Sold Units</span>
            <span className="font-display font-black text-2xl text-neutral-500 mt-1 block">{soldLaptops.length}</span>
            <span className="font-sans text-[10px] text-[#6B6B6B] mt-0.5 block">Archived client reviews</span>
          </div>
        </div>

        {/* Workspace Tabs Navigation */}
        <div className="border-b border-[#E5E5E5] flex flex-wrap gap-1 mb-6">
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
            onClick={() => setActiveTab('daily-views')}
            className={`px-4 py-3 font-sans text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'daily-views' 
                ? 'border-[#FF3B30] text-[#111111]' 
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <span className="flex items-center space-x-2">
              <TrendingUp className={`h-4 w-4 ${activeTab === 'daily-views' ? 'text-[#FF3B30]' : 'text-neutral-500'}`} />
              <span>Link Views by Day</span>
              <span className="font-mono text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 border border-emerald-300 flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{todayTotalViews} today</span>
              </span>
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
              <span>Archive & Feedback</span>
              {testimonials.filter(t => t.status === 'pending' || (t.submittedByCustomer && t.isLive === false && t.status !== 'hidden')).length > 0 && (
                <span className="bg-amber-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse flex items-center space-x-0.5">
                  <span>⚡</span>
                  <span>{testimonials.filter(t => t.status === 'pending' || (t.submittedByCustomer && t.isLive === false && t.status !== 'hidden')).length} new</span>
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-3 font-sans text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'reservations' 
                ? 'border-[#FF3B30] text-[#111111]' 
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-[#FF3B30]" />
              <span>24h Reservations ({reservations.length})</span>
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
                    <th className="p-4 font-bold">Link Views (Today / Total)</th>
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
                        <div className="space-y-1.5">
                          {/* Today's Views Badge */}
                          <div className="flex items-center space-x-1.5">
                            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold flex items-center space-x-1 border ${
                              getLaptopTodayViews(laptop) > 0
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${getLaptopTodayViews(laptop) > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                              <span>{getLaptopTodayViews(laptop)} today</span>
                            </span>
                          </div>

                          {/* All-time Total Views */}
                          <div className="flex items-center space-x-1 font-mono text-[11px] text-neutral-600">
                            <Eye className="h-3 w-3 text-blue-600" />
                            <span className="font-bold text-[#111111]">{laptop.viewCount || 0}</span>
                            <span className="text-[10px] text-neutral-400">total</span>
                          </div>

                          {/* Direct Share Link Action */}
                          <button
                            type="button"
                            onClick={() => handleCopyDirectLink(laptop.id)}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 hover:underline cursor-pointer pt-0.5"
                            title="Copy shareable direct link to this laptop"
                          >
                            {copiedLinkLaptopId === laptop.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Link Copied!</span>
                              </>
                            ) : (
                              <>
                                <Link2 className="h-3 w-3" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
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
                      <td colSpan={7} className="p-8 text-center text-[#6B6B6B] font-sans">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E5E5E5] pb-4">
              <div>
                <h2 className="font-display font-bold text-sm text-[#111111]">
                  Launch New Laptop Listing
                </h2>
                <p className="font-sans text-xs text-[#6B6B6B] mt-1">
                  Enter precise physical condition details, diagnostic outputs, serial codes and detailed specifications.
                </p>
              </div>

              {(formName || formCpu || formSerial || formDescription || driveLinkInput || formImages.length > 0) && (
                <div className="bg-amber-50 border border-amber-200 px-3 py-2 flex items-center justify-between sm:justify-end space-x-3 text-xs text-amber-900 shrink-0">
                  <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                    <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>Draft auto-saved</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearAddDraft}
                    className="text-amber-800 hover:text-red-600 font-bold underline text-[11px] cursor-pointer"
                  >
                    Discard Draft
                  </button>
                </div>
              )}
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
                    <CustomMultiSelect
                      label="Primary Use Case(s)"
                      required
                      value={formCategory}
                      options={USE_CASE_OPTIONS}
                      onChange={setFormCategory}
                      placeholder="-- Select Primary Use Case(s) --"
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-sans text-xs font-bold text-neutral-700">
                      Laptop Images ({formImages.length})
                    </label>
                    <span className="font-mono text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-bold flex items-center space-x-1">
                      <ImageIcon className="h-3 w-3 text-emerald-600" />
                      <span>Cloudinary Signed Uploads</span>
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
                      <span>Cloudinary File Upload</span>
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
                          disabled={isUploadingImage}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                        />
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Upload className="h-4 w-4 text-[#FF3B30]" />
                          </div>
                          <div>
                            <p className="font-sans text-xs font-bold text-[#111111]">
                              {isUploadingImage ? 'Uploading to Cloudinary...' : 'Click or Drag & Drop Image Files'}
                            </p>
                            <p className="font-mono text-[10px] text-neutral-400 mt-0.5">
                              Cloudinary auto-format & quality optimization • Folder: rightware_laptops
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Google Drive / Web Link */}
                  {imageSourceMode === 'drive' && (
                    <div className="space-y-1.5">
                      {(() => {
                        const duplicateWarning = getDuplicateImageWarning(driveLinkInput, formImages);
                        return (
                          <>
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
                                className={`flex-1 bg-white border px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden ${
                                  duplicateWarning
                                    ? 'border-amber-500 bg-amber-50/20 text-amber-950 focus:border-amber-600 ring-1 ring-amber-500/30'
                                    : 'border-[#E5E5E5] focus:border-[#111111]'
                                }`}
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

                            {duplicateWarning && (
                              <div className="flex items-start space-x-2 p-2 bg-amber-50 border border-amber-300 text-amber-950 font-sans text-xs font-semibold rounded-xs">
                                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold">⚠️ Duplicate Image URL Detected</p>
                                  <p className="font-normal text-[11px] text-amber-800 mt-0.5">{duplicateWarning}</p>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      label="Storage Capacity"
                      required
                      value={formStorage}
                      options={STORAGE_OPTIONS}
                      onChange={setFormStorage}
                      placeholder="-- Select Storage --"
                      customPlaceholder="Type custom storage size..."
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label="Storage Type (SSD / HDD)"
                      required
                      value={formStorageType}
                      options={STORAGE_TYPE_OPTIONS}
                      onChange={setFormStorageType}
                      placeholder="-- Select Storage Type --"
                      customPlaceholder="Type custom storage type (SSD/HDD)..."
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
                Detailed Condition Description
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

        {/* TAB 3: SOLD Products, Feedbacks list & Customer Review Moderation */}
        {activeTab === 'sold' && (() => {
          const pendingReviews = testimonials.filter(
            t => t.status === 'pending' || (t.submittedByCustomer && t.isLive === false && t.status !== 'hidden')
          );
          const liveTestimonials = testimonials.filter(
            t => t.isLive !== false && t.status !== 'pending' && t.status !== 'hidden'
          );
          const hiddenTestimonials = testimonials.filter(
            t => t.status === 'hidden' || (t.isLive === false && t.status !== 'pending' && !t.submittedByCustomer)
          );

          return (
            <div className="space-y-8">
              {/* 1. CUSTOMER SUBMISSIONS MODERATION QUEUE */}
              <div className="bg-white border-2 border-amber-300 overflow-hidden shadow-xs">
                <div className="p-5 border-b border-amber-200 bg-amber-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="bg-amber-500 text-white font-mono text-[10px] font-black px-2 py-0.5 uppercase tracking-wider flex items-center space-x-1">
                        <span>⚡ Moderation Queue</span>
                      </span>
                      <h2 className="font-display font-bold text-sm text-[#111111]">
                        Customer Submissions Awaiting Review ({pendingReviews.length})
                      </h2>
                    </div>
                    <p className="font-sans text-xs text-neutral-600 mt-1">
                      Reviews submitted by buyers on the public storefront. Review, verify, edit details, or publish them live to the homepage.
                    </p>
                  </div>

                  {pendingReviews.length > 0 && (
                    <span className="font-mono text-[11px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1 self-start sm:self-auto">
                      {pendingReviews.length} {pendingReviews.length === 1 ? 'review' : 'reviews'} need attention
                    </span>
                  )}
                </div>

                <div className="p-5 bg-neutral-50/40">
                  {pendingReviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingReviews.map((t) => (
                        <div key={t.id} className="bg-white border-2 border-amber-300 p-4 shadow-sm flex flex-col justify-between space-y-4 relative">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center space-x-2">
                                <span className="bg-amber-100 text-amber-900 font-mono text-[9px] font-black px-2 py-0.5 border border-amber-300 uppercase">
                                  Pending Approval
                                </span>
                                {t.createdAt && (
                                  <span className="font-mono text-[9px] text-neutral-400">
                                    {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                {[...Array(t.rating || 5)].map((_, i) => (
                                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            </div>

                            {/* Review Quote */}
                            <p className="font-sans text-xs italic text-[#111111] bg-amber-50/50 p-3 border border-dashed border-amber-200 leading-relaxed font-medium">
                              "{t.quote}"
                            </p>

                            {/* Customer Profile & Laptop Info */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                  alt={t.name}
                                  className="w-8 h-8 rounded-full object-cover border border-[#E5E5E5] shrink-0"
                                />
                                <div>
                                  <h4 className="font-display font-bold text-xs text-[#111111]">{t.name}</h4>
                                  <p className="font-sans text-[10px] text-neutral-500">{t.role || 'Verified Customer'}</p>
                                </div>
                              </div>

                              <div className="font-mono text-[10px] text-[#FF3B30] font-bold flex items-center space-x-1 pt-1">
                                <Package className="h-3.5 w-3.5 shrink-0" />
                                <span>Purchased: {t.laptopBought}</span>
                              </div>

                              {/* Customer Contact Details (Private to Admin) */}
                              {(t.customerPhone || t.customerEmail) && (
                                <div className="bg-neutral-100 p-2 border border-neutral-200 font-mono text-[9px] text-neutral-700 space-y-0.5 mt-2">
                                  <span className="font-bold text-neutral-900 block uppercase">Private Contact info:</span>
                                  {t.customerPhone && <div>📞 Phone: <span className="font-bold text-[#111111]">{t.customerPhone}</span></div>}
                                  {t.customerEmail && <div>✉️ Email: <span className="font-bold text-[#111111]">{t.customerEmail}</span></div>}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteTestimonialClick(t.id)}
                              className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 font-sans text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Reject / Delete</span>
                            </button>

                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditTestimonial(t)}
                                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-[#111111] font-sans text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 border border-neutral-300"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Review & Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleApproveAndMakeLive(t)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Approve & Go Live</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-neutral-500 font-sans bg-white border border-neutral-200">
                      <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                      <p className="font-bold text-xs text-neutral-800">All customer submissions are up to date.</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        New reviews submitted by customers on the storefront will appear here for verification before publishing.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. LIVE HOMEPAGE TESTIMONIALS MANAGER */}
              <div className="bg-white border border-[#E5E5E5] overflow-hidden shadow-2xs">
                <div className="p-5 border-b border-[#E5E5E5] bg-[#FAF9F9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-[#FF3B30] fill-[#FF3B30]" />
                      <h2 className="font-display font-bold text-sm text-[#111111]">
                        Live Homepage Customer Testimonials ({liveTestimonials.length})
                      </h2>
                      <span className="font-mono text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 border border-emerald-300">
                        LIVE ON HOMEPAGE
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#6B6B6B] mt-1">
                      These reviews are currently visible on the public homepage. You can edit text, link to sold laptops, take offline, or delete anytime.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenAddTestimonial()}
                    className="bg-[#FF3B30] hover:bg-[#D32F2F] text-white font-sans text-xs font-bold px-4 py-2.5 transition-colors cursor-pointer flex items-center space-x-1.5 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Homepage Testimonial</span>
                  </button>
                </div>

                {/* Grid of Live Homepage Testimonials */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-neutral-50/50">
                  {liveTestimonials.map((t) => {
                    const linkedSold = t.soldLaptopId ? soldLaptops.find(s => s.id === t.soldLaptopId) : null;
                    return (
                      <div key={t.id} className="bg-white border border-[#E5E5E5] p-4 flex flex-col justify-between space-y-4 shadow-xs hover:border-neutral-300 transition-all">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              {[...Array(t.rating || 5)].map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 fill-[#FF3B30] text-[#FF3B30]" />
                              ))}
                            </div>
                            <div className="flex items-center space-x-1">
                              {t.submittedByCustomer && (
                                <span className="font-mono text-[8px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5">
                                  Customer Review
                                </span>
                              )}
                              {t.verifiedPurchase && (
                                <span className="font-mono text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 flex items-center space-x-1">
                                  <ShieldCheck className="h-3 w-3" />
                                  <span>Verified Buyer</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="font-sans text-xs italic text-[#222222] bg-neutral-50 p-2.5 border border-dashed border-[#E5E5E5] leading-relaxed">
                            "{t.quote}"
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#F0F0F0] space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                              <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full object-cover border border-[#E5E5E5] filter grayscale shrink-0" />
                              <div className="min-w-0">
                                <h4 className="font-display font-bold text-xs text-[#111111] truncate">{t.name}</h4>
                                <p className="font-sans text-[10px] text-[#6B6B6B] truncate">{t.role}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleTestimonialLiveStatus(t)}
                                className="p-1.5 text-neutral-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                                title="Take Offline (Hide from Homepage)"
                              >
                                <EyeOff className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditTestimonial(t)}
                                className="p-1.5 text-neutral-600 hover:text-[#111111] hover:bg-neutral-100 transition-colors cursor-pointer"
                                title="Edit Testimonial"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTestimonialClick(t.id)}
                                className="p-1.5 text-neutral-400 hover:text-[#FF3B30] hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Testimonial"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="font-mono text-[9px] text-[#FF3B30] uppercase tracking-wider flex items-center space-x-1">
                            <Package className="h-3 w-3 shrink-0" />
                            <span className="truncate">Bought: {t.laptopBought}</span>
                          </div>

                          {linkedSold && (
                            <span className="font-mono text-[9px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 block truncate">
                              Linked Sold Laptop: S/N {linkedSold.serialNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {liveTestimonials.length === 0 && (
                    <div className="col-span-full p-8 text-center text-[#6B6B6B] font-sans">
                      <p className="font-bold text-sm text-neutral-700">No live testimonials published yet.</p>
                      <p className="text-xs text-neutral-500 mt-1">Click "Add Homepage Testimonial" above or approve a review from the moderation queue.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. HIDDEN / OFFLINE ARCHIVED TESTIMONIALS (IF ANY) */}
              {hiddenTestimonials.length > 0 && (
                <div className="bg-white border border-[#E5E5E5] overflow-hidden shadow-2xs">
                  <div className="p-4 border-b border-[#E5E5E5] bg-neutral-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-xs text-[#111111] flex items-center space-x-1.5">
                        <EyeOff className="h-4 w-4 text-neutral-500" />
                        <span>Hidden / Draft Testimonials ({hiddenTestimonials.length})</span>
                      </h3>
                      <p className="font-sans text-[11px] text-neutral-500">
                        Saved in database but currently hidden from the public homepage.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-neutral-50">
                    {hiddenTestimonials.map((t) => (
                      <div key={t.id} className="bg-white border border-neutral-300 p-3.5 flex flex-col justify-between space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 font-bold">
                              OFFLINE
                            </span>
                            <div className="flex items-center space-x-0.5">
                              {[...Array(t.rating || 5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-neutral-400 text-neutral-400" />
                              ))}
                            </div>
                          </div>
                          <p className="font-sans text-xs italic text-neutral-700 bg-neutral-50 p-2 border border-neutral-200">
                            "{t.quote}"
                          </p>
                          <div className="font-sans text-xs font-bold text-[#111111]">{t.name} ({t.laptopBought})</div>
                        </div>

                        <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleDeleteTestimonialClick(t.id)}
                            className="text-rose-600 hover:underline font-sans text-xs"
                          >
                            Delete
                          </button>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditTestimonial(t)}
                              className="text-neutral-700 hover:underline font-sans text-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleTestimonialLiveStatus(t)}
                              className="bg-[#111111] hover:bg-[#FF3B30] text-white px-2.5 py-1 font-sans text-xs font-bold transition-colors cursor-pointer"
                            >
                              Publish Live
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. ARCHIVED SALES & CLIENT REVIEWS */}
              <div className="bg-white border border-[#E5E5E5] overflow-hidden shadow-2xs">
                <div className="p-5 border-b border-[#E5E5E5] bg-[#FAF9F9]">
                  <h2 className="font-display font-bold text-sm text-[#111111]">
                    Archived Sales & Client Reviews ({soldLaptops.length})
                  </h2>
                  <p className="font-sans text-xs text-[#6B6B6B] mt-1">
                    Completed sales archive. Update buyer review details or publish any sold unit directly as a homepage testimonial.
                  </p>
                </div>

                <div className="divide-y divide-[#E5E5E5]">
                  {soldLaptops.map((laptop) => {
                    const existingTestimonial = testimonials.find(
                      t => t.soldLaptopId === laptop.id || (t.laptopBought && t.laptopBought.toLowerCase().trim() === laptop.name.toLowerCase().trim())
                    );

                    return (
                      <div key={laptop.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-neutral-50/50 transition-colors">
                        <div className="flex items-start space-x-4 flex-1">
                          <img 
                            src={laptop.image} 
                            alt={laptop.name} 
                            className="w-16 h-12 object-cover border border-[#E5E5E5] flex-shrink-0 filter grayscale"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-sans font-bold text-[#111111] text-sm">
                                {laptop.name}
                              </h4>
                              {existingTestimonial && (
                                <span className="font-mono text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 border border-emerald-300 flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                                  <span>Published on Homepage</span>
                                </span>
                              )}
                            </div>

                            <p className="font-mono text-[9px] text-[#6B6B6B]">
                              S/N: {laptop.serialNumber} • Buyer Name: <strong className="text-[#111111]">{laptop.buyerName || 'Verified Client'}</strong>
                            </p>

                            {laptop.buyerFeedback ? (
                              <p className="font-sans text-xs text-[#555555] italic mt-2 bg-neutral-50 p-3 border border-dashed border-[#D4D4D4] leading-relaxed relative">
                                "{laptop.buyerFeedback}"
                              </p>
                            ) : (
                              <span className="font-mono text-[9px] text-neutral-400 block mt-1">
                                No feedback message recorded yet.
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0">
                          <div className="text-left md:text-right">
                            <span className="font-mono text-[10px] text-[#FF3B30] uppercase font-bold tracking-wider block">
                              {laptop.deliveredDate || 'DELIVERED'}
                            </span>
                            <span className="font-mono text-sm font-bold text-neutral-400 line-through mt-0.5 block">
                              {formatNaira(laptop.price)}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleStartEditSoldLaptop(laptop)}
                              className="bg-neutral-100 hover:bg-neutral-200 text-[#111111] font-sans text-xs font-bold px-3 py-1.5 transition-colors cursor-pointer flex items-center space-x-1 border border-[#E5E5E5]"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-neutral-600" />
                              <span>Edit Review</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenAddTestimonial(laptop)}
                              className="bg-[#111111] hover:bg-[#FF3B30] text-white font-sans text-xs font-bold px-3 py-1.5 transition-colors cursor-pointer flex items-center space-x-1"
                            >
                              <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                              <span>{existingTestimonial ? 'Update Testimonial' : '+ Publish as Testimonial'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {soldLaptops.length === 0 && (
                    <div className="p-8 text-center text-[#6B6B6B] font-sans">
                      No sold archive found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 4: Physical Inspection 24h Reservations */}
        {activeTab === 'reservations' && (
          <div className="bg-white border border-[#E5E5E5] shadow-xs">
            <div className="p-4 bg-neutral-50 border-b border-[#E5E5E5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-display font-extrabold text-sm text-[#111111] flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-[#FF3B30]" />
                  <span>Physical Inspection 24-Hour Hold Queue</span>
                </h3>
                <p className="font-sans text-xs text-[#6B6B6B] mt-0.5">
                  Real-time client reservation inputs submitted from the storefront modal.
                </p>
              </div>
              <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 border border-emerald-300">
                ● LIVE SYNC ACTIVE ({reservations.length} BOOKINGS)
              </span>
            </div>

            <div className="divide-y divide-[#E5E5E5]">
              {reservations.map((res: any, idx: number) => (
                <div key={res.id || idx} className="p-4 sm:p-5 hover:bg-neutral-50/70 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] bg-[#111111] text-white font-bold px-2 py-0.5 uppercase">
                        {res.userLocation || 'Lagos'}
                      </span>
                      <h4 className="font-display font-bold text-sm text-[#111111]">
                        {res.laptopName || 'Laptop Unit'}
                      </h4>
                      <span className="font-mono text-[10px] text-neutral-500 font-semibold">
                        S/N: {res.serialNumber || 'N/A'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#444444] font-sans pt-1">
                      <div>
                        <span className="text-neutral-400 font-mono text-[10px] uppercase block">Client Name</span>
                        <strong className="text-[#111111]">{res.userName}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-mono text-[10px] uppercase block">Phone Line</span>
                        <strong className="text-[#FF3B30] font-mono">{res.userPhone}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-mono text-[10px] uppercase block">Inspection Price</span>
                        <strong className="text-emerald-700 font-mono">{res.price ? formatNaira(res.price) : 'N/A'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end md:self-center">
                    <a
                      href={`tel:${res.userPhone}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold px-3.5 py-2 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>Call Client</span>
                    </a>
                  </div>
                </div>
              ))}

              {reservations.length === 0 && (
                <div className="p-10 text-center text-[#6B6B6B] font-sans">
                  <Clock className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                  <p className="font-bold text-sm text-neutral-700">No active 24h reservations yet.</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    When buyers reserve laptops for 24-hour physical inspection, their details will appear here instantly.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Link Views Logged by Days (Analytics) */}
        {activeTab === 'daily-views' && (() => {
          // Collect all recorded date strings
          const allRecordedDatesSet = new Set<string>();
          allRecordedDatesSet.add(todayDateStr);
          allRecordedDatesSet.add(yesterdayDateStr);
          last7DaysArr.forEach(d => allRecordedDatesSet.add(d));

          dailyViewsData.forEach(d => {
            if (d.date) allRecordedDatesSet.add(d.date);
            if (d.id && /^\d{4}-\d{2}-\d{2}$/.test(d.id)) allRecordedDatesSet.add(d.id);
          });

          allInventoryAndSold.forEach(l => {
            if (l.dailyViews) {
              Object.keys(l.dailyViews).forEach(d => {
                if (/^\d{4}-\d{2}-\d{2}$/.test(d)) allRecordedDatesSet.add(d);
              });
            }
          });

          const sortedAllDates = Array.from(allRecordedDatesSet).sort((a, b) => b.localeCompare(a));

          let filteredDatesList: string[] = [];
          if (selectedDateRange === 'today') {
            filteredDatesList = [todayDateStr];
          } else if (selectedDateRange === 'yesterday') {
            filteredDatesList = [yesterdayDateStr];
          } else if (selectedDateRange === '7days') {
            filteredDatesList = last7DaysArr;
          } else if (selectedDateRange === '14days') {
            filteredDatesList = last14DaysArr;
          } else if (selectedDateRange === '30days') {
            filteredDatesList = last30DaysArr;
          } else if (selectedDateRange === 'custom') {
            filteredDatesList = customDateFilter ? [customDateFilter] : [todayDateStr];
          } else {
            filteredDatesList = sortedAllDates;
          }

          // 14 days chart data calculation
          const chart14Days = last14DaysArr.slice().reverse().map(dateStr => {
            const dayViews = allInventoryAndSold.reduce((sum, l) => sum + getLaptopViewsOnDate(l, dateStr), 0);
            const parts = dateStr.split('-');
            const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const isToday = dateStr === todayDateStr;
            return { dateStr, label, dayViews, isToday };
          });

          const maxChartViews = Math.max(...chart14Days.map(c => c.dayViews), 4);

          // Format friendly date string
          const formatFriendlyDate = (dateStr: string) => {
            try {
              const parts = dateStr.split('-');
              if (parts.length === 3) {
                const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
                const full = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                return { weekday, full };
              }
            } catch (e) {}
            return { weekday: '', full: dateStr };
          };

          // Filter laptops for the Performance Matrix table
          const matrixLaptops = allInventoryAndSold.filter(l => {
            if (!analyticsSearch.trim()) return true;
            const q = analyticsSearch.toLowerCase();
            return (
              l.name.toLowerCase().includes(q) ||
              l.brand.toLowerCase().includes(q) ||
              (l.serialNumber && l.serialNumber.toLowerCase().includes(q))
            );
          });

          return (
            <div className="space-y-6">
              {/* Analytics Top Control Header */}
              <div className="bg-white border border-[#E5E5E5] p-5 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="font-display font-extrabold text-base text-[#111111] flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-[#FF3B30]" />
                        <span>Link Views Logged by Days</span>
                      </h2>
                      <span className="font-mono text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 border border-emerald-300 flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>LIVE DAY COUNTER ACTIVE</span>
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#6B6B6B] mt-1">
                      Tracks visitor engagement, direct share links, and storefront modal openings per individual day and all-time.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        const url = window.location.origin;
                        navigator.clipboard.writeText(url);
                        triggerNotification(`Copied Storefront Home Link: ${url}`);
                      }}
                      className="bg-neutral-100 hover:bg-neutral-200 text-[#111111] border border-[#D4D4D4] px-3 py-2 font-sans text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Store Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (laptops.length > 0) {
                          handleCopyDirectLink(laptops[0].id);
                        }
                      }}
                      className="bg-[#111111] hover:bg-[#FF3B30] text-white px-3.5 py-2 font-sans text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      <span>Copy Sample Direct Link</span>
                    </button>
                  </div>
                </div>

                {/* 5 High-Impact Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5 pt-5 border-t border-[#E5E5E5]">
                  <div className="bg-emerald-50/60 border border-emerald-300 p-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-emerald-800 font-bold uppercase tracking-wider">Today (Present Day)</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <span className="font-display font-black text-2xl text-emerald-950 mt-1 block">
                      {todayTotalViews}
                    </span>
                    <span className="font-sans text-[10px] text-emerald-700 font-medium block mt-0.5">
                      Views logged today
                    </span>
                  </div>

                  <div className="bg-white border border-[#E5E5E5] p-3 shadow-2xs">
                    <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">Yesterday</span>
                    <span className="font-display font-black text-2xl text-[#111111] mt-1 block">
                      {yesterdayTotalViews}
                    </span>
                    <span className="font-sans text-[10px] text-neutral-500 block mt-0.5">
                      {yesterdayDateStr}
                    </span>
                  </div>

                  <div className="bg-white border border-[#E5E5E5] p-3 shadow-2xs">
                    <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">Past 7 Days</span>
                    <span className="font-display font-black text-2xl text-[#111111] mt-1 block">
                      {last7DaysTotalViews}
                    </span>
                    <span className="font-sans text-[10px] text-neutral-500 block mt-0.5">
                      Weekly traffic total
                    </span>
                  </div>

                  <div className="bg-white border border-[#E5E5E5] p-3 shadow-2xs">
                    <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">Past 30 Days</span>
                    <span className="font-display font-black text-2xl text-[#111111] mt-1 block">
                      {last30DaysTotalViews}
                    </span>
                    <span className="font-sans text-[10px] text-neutral-500 block mt-0.5">
                      Monthly traffic total
                    </span>
                  </div>

                  <div className="bg-white border border-[#E5E5E5] p-3 shadow-2xs col-span-2 sm:col-span-1">
                    <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">All-Time Views</span>
                    <span className="font-display font-black text-2xl text-blue-600 mt-1 block flex items-center space-x-1">
                      <span>{overallTotalViews}</span>
                      <Eye className="h-4 w-4" />
                    </span>
                    <span className="font-sans text-[10px] text-blue-600 font-medium block mt-0.5">
                      Total lifetime clicks
                    </span>
                  </div>
                </div>
              </div>

              {/* 14-Day Visual Activity Bar Chart */}
              <div className="bg-white border border-[#E5E5E5] p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#111111] flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-[#FF3B30]" />
                      <span>Past 14 Days Visual Activity Trajectory</span>
                    </h3>
                    <span className="font-sans text-[11px] text-[#6B6B6B]">
                      Click any day column to filter and view the logged model views for that specific date.
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-500 bg-neutral-100 px-2 py-1 border border-neutral-200">
                    Max: {maxChartViews} views/day
                  </span>
                </div>

                <div className="pt-6 pb-2">
                  <div className="flex items-end justify-between gap-1.5 h-44 px-2 border-b border-[#E5E5E5]">
                    {chart14Days.map((c) => {
                      const heightPercent = Math.max(8, Math.round((c.dayViews / maxChartViews) * 100));
                      const isSelected = (selectedDateRange === 'custom' && customDateFilter === c.dateStr) || 
                                        (selectedDateRange === 'today' && c.isToday) ||
                                        (selectedDateRange === 'yesterday' && c.dateStr === yesterdayDateStr);
                      return (
                        <div
                          key={c.dateStr}
                          onClick={() => {
                            setSelectedDateRange('custom');
                            setCustomDateFilter(c.dateStr);
                          }}
                          className={`flex-1 flex flex-col items-center h-full justify-end group cursor-pointer transition-all p-1 ${
                            isSelected ? 'bg-neutral-100/70 rounded-none' : ''
                          }`}
                          title={`${c.label} (${c.dateStr}): ${c.dayViews} views`}
                        >
                          {/* Count Badge on Top */}
                          <span className={`font-mono text-[10px] font-bold mb-1 transition-transform group-hover:-translate-y-0.5 ${
                            c.isToday 
                              ? 'text-emerald-700 font-extrabold' 
                              : c.dayViews > 0 
                                ? 'text-[#111111]' 
                                : 'text-neutral-300'
                          }`}>
                            {c.dayViews}
                          </span>

                          {/* Bar Graphic */}
                          <div className="w-full max-w-[32px] bg-neutral-100 h-full flex items-end">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full transition-all duration-300 ${
                                c.isToday
                                  ? 'bg-emerald-600 group-hover:bg-emerald-700'
                                  : c.dayViews > 0
                                    ? 'bg-[#111111] group-hover:bg-[#FF3B30]'
                                    : 'bg-neutral-200 group-hover:bg-neutral-300'
                              }`}
                            />
                          </div>

                          {/* Date Label Below */}
                          <div className="mt-2 text-center">
                            <span className={`font-mono text-[9px] block whitespace-nowrap ${
                              c.isToday ? 'text-emerald-700 font-bold' : 'text-neutral-500'
                            }`}>
                              {c.label}
                            </span>
                            {c.isToday && (
                              <span className="font-mono text-[8px] text-emerald-600 font-black block uppercase tracking-tighter">
                                TODAY
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Filtering and Search Toolbar */}
              <div className="bg-white border border-[#E5E5E5] p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Date Range Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[10px] text-neutral-400 uppercase mr-1 flex items-center space-x-1">
                    <Filter className="h-3 w-3" />
                    <span>Filter:</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => { setSelectedDateRange('today'); setCustomDateFilter(''); }}
                    className={`px-3 py-1.5 font-sans text-xs font-bold transition-all cursor-pointer border ${
                      selectedDateRange === 'today'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    ● Today ({todayTotalViews})
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedDateRange('yesterday'); setCustomDateFilter(''); }}
                    className={`px-3 py-1.5 font-sans text-xs font-bold transition-all cursor-pointer border ${
                      selectedDateRange === 'yesterday'
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    Yesterday ({yesterdayTotalViews})
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedDateRange('7days'); setCustomDateFilter(''); }}
                    className={`px-3 py-1.5 font-sans text-xs font-bold transition-all cursor-pointer border ${
                      selectedDateRange === '7days'
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    Past 7 Days
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedDateRange('14days'); setCustomDateFilter(''); }}
                    className={`px-3 py-1.5 font-sans text-xs font-bold transition-all cursor-pointer border ${
                      selectedDateRange === '14days'
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    Past 14 Days
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedDateRange('30days'); setCustomDateFilter(''); }}
                    className={`px-3 py-1.5 font-sans text-xs font-bold transition-all cursor-pointer border ${
                      selectedDateRange === '30days'
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    Past 30 Days
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedDateRange('all'); setCustomDateFilter(''); }}
                    className={`px-3 py-1.5 font-sans text-xs font-bold transition-all cursor-pointer border ${
                      selectedDateRange === 'all'
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    All Recorded Days
                  </button>
                </div>

                {/* Custom Date Input & Search */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-1.5 bg-neutral-50 border border-neutral-200 px-2 py-1">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                    <input
                      type="date"
                      value={customDateFilter}
                      onChange={(e) => {
                        setCustomDateFilter(e.target.value);
                        if (e.target.value) setSelectedDateRange('custom');
                      }}
                      className="bg-transparent text-xs font-mono font-medium text-neutral-800 outline-hidden cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5 bg-white border border-[#E5E5E5] px-2.5 py-1.5 flex-1 sm:w-60">
                    <input
                      type="text"
                      placeholder="Search laptop name, brand, S/N..."
                      value={analyticsSearch}
                      onChange={(e) => setAnalyticsSearch(e.target.value)}
                      className="w-full text-xs font-sans text-[#111111] placeholder:text-neutral-400 outline-hidden"
                    />
                    {analyticsSearch && (
                      <button
                        type="button"
                        onClick={() => setAnalyticsSearch('')}
                        className="text-neutral-400 hover:text-[#111111]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {(customDateFilter || selectedDateRange !== '7days' || analyticsSearch) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDateRange('7days');
                        setCustomDateFilter('');
                        setAnalyticsSearch('');
                      }}
                      className="text-xs font-sans text-[#FF3B30] hover:underline font-bold px-2 py-1 cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Logged Daily Views Activity Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#111111] flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-[#FF3B30]" />
                    <span>Daily Logs Breakdown ({filteredDatesList.length} Days Displayed)</span>
                  </h3>
                  <span className="font-mono text-[10px] text-neutral-500 font-medium">
                    Showing views aggregated by calendar day
                  </span>
                </div>

                <div className="space-y-4">
                  {filteredDatesList.map((dateStr) => {
                    const isToday = dateStr === todayDateStr;
                    const isYesterday = dateStr === yesterdayDateStr;
                    const dateInfo = formatFriendlyDate(dateStr);
                    const dayTotalViews = allInventoryAndSold.reduce((acc, l) => acc + getLaptopViewsOnDate(l, dateStr), 0);

                    // Get list of laptops viewed on this day
                    const viewedLaptopsOnDay = allInventoryAndSold
                      .map(l => ({
                        laptop: l,
                        viewsOnDay: getLaptopViewsOnDate(l, dateStr)
                      }))
                      .filter(item => {
                        if (item.viewsOnDay <= 0) return false;
                        if (!analyticsSearch.trim()) return true;
                        const q = analyticsSearch.toLowerCase();
                        return (
                          item.laptop.name.toLowerCase().includes(q) ||
                          item.laptop.brand.toLowerCase().includes(q) ||
                          (item.laptop.serialNumber && item.laptop.serialNumber.toLowerCase().includes(q))
                        );
                      })
                      .sort((a, b) => b.viewsOnDay - a.viewsOnDay);

                    // If not today and 0 views recorded, and filtering for 'all', we can skip empty historic days
                    if (!isToday && dayTotalViews === 0 && selectedDateRange === 'all') {
                      return null;
                    }

                    return (
                      <div
                        key={dateStr}
                        className={`bg-white border transition-all ${
                          isToday
                            ? 'border-emerald-300 shadow-sm'
                            : 'border-[#E5E5E5] shadow-xs'
                        }`}
                      >
                        {/* Day Card Header */}
                        <div className={`p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                          isToday
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-neutral-50/80 border-[#E5E5E5]'
                        }`}>
                          <div className="flex items-center space-x-2.5">
                            <div className={`p-2 ${isToday ? 'bg-emerald-600 text-white' : 'bg-[#111111] text-white'}`}>
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-display font-extrabold text-sm text-[#111111]">
                                  {dateInfo.weekday}, {dateInfo.full}
                                </h4>
                                {isToday && (
                                  <span className="font-mono text-[9px] bg-emerald-600 text-white font-black px-2 py-0.5 uppercase tracking-wider flex items-center space-x-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                    <span>PRESENT DAY</span>
                                  </span>
                                )}
                                {isYesterday && (
                                  <span className="font-mono text-[9px] bg-neutral-200 text-neutral-800 font-bold px-1.5 py-0.5 uppercase">
                                    Yesterday
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[10px] text-neutral-500 block mt-0.5">
                                Date Key: <code className="text-neutral-700 font-bold">{dateStr}</code>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 self-end sm:self-center">
                            <div className="text-right">
                              <span className="font-mono text-[10px] text-neutral-400 uppercase block">Total Day Views</span>
                              <div className="flex items-center space-x-1.5 justify-end">
                                <span className={`font-display font-black text-lg ${isToday ? 'text-emerald-800' : 'text-[#111111]'}`}>
                                  {dayTotalViews}
                                </span>
                                <Eye className={`h-3.5 w-3.5 ${isToday ? 'text-emerald-600' : 'text-blue-600'}`} />
                              </div>
                            </div>

                            <span className="h-6 w-px bg-neutral-200 hidden sm:block" />

                            <div className="text-right">
                              <span className="font-mono text-[10px] text-neutral-400 uppercase block">Models Viewed</span>
                              <span className="font-display font-bold text-sm text-neutral-700 block">
                                {viewedLaptopsOnDay.length} units
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Day's Models Breakdown List */}
                        <div className="p-4">
                          {viewedLaptopsOnDay.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {viewedLaptopsOnDay.map(({ laptop, viewsOnDay }) => {
                                const dayTrafficShare = dayTotalViews > 0 ? Math.round((viewsOnDay / dayTotalViews) * 100) : 0;
                                return (
                                  <div
                                    key={laptop.id}
                                    className="border border-[#E5E5E5] p-3 hover:border-neutral-400 transition-colors flex items-start justify-between gap-3 bg-white"
                                  >
                                    <div className="flex items-start space-x-3">
                                      <img
                                        src={laptop.image}
                                        alt={laptop.name}
                                        className="w-14 h-11 object-cover border border-[#E5E5E5] flex-shrink-0"
                                      />
                                      <div className="min-w-0">
                                        <h5 className="font-display font-bold text-xs text-[#111111] truncate max-w-[180px] sm:max-w-[240px]">
                                          {laptop.name}
                                        </h5>
                                        <div className="flex items-center space-x-2 text-[10px] font-mono text-neutral-500 mt-0.5">
                                          <span>S/N: {laptop.serialNumber || 'N/A'}</span>
                                          <span>•</span>
                                          <span className="text-emerald-700 font-bold">{formatNaira(laptop.price)}</span>
                                        </div>
                                        
                                        {/* Traffic Share Bar */}
                                        <div className="flex items-center space-x-2 mt-2">
                                          <div className="w-20 bg-neutral-100 h-1.5 overflow-hidden">
                                            <div
                                              style={{ width: `${dayTrafficShare}%` }}
                                              className={`h-full ${isToday ? 'bg-emerald-600' : 'bg-[#FF3B30]'}`}
                                            />
                                          </div>
                                          <span className="font-mono text-[9px] text-neutral-400">
                                            {dayTrafficShare}% of day's views
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                                      <div className="flex items-center space-x-1 bg-neutral-50 border border-neutral-200 px-2 py-0.5">
                                        <Eye className="h-3 w-3 text-blue-600" />
                                        <span className="font-mono font-bold text-xs text-[#111111]">{viewsOnDay}</span>
                                        <span className="font-sans text-[9px] text-neutral-400">views</span>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleCopyDirectLink(laptop.id)}
                                        className="text-[10px] text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 hover:underline cursor-pointer mt-2"
                                        title="Copy direct link for this laptop"
                                      >
                                        {copiedLinkLaptopId === laptop.id ? (
                                          <>
                                            <Check className="h-3 w-3 text-emerald-600" />
                                            <span className="text-emerald-600 font-bold">Copied</span>
                                          </>
                                        ) : (
                                          <>
                                            <Link2 className="h-3 w-3" />
                                            <span>Copy Link</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="py-6 text-center text-neutral-500 font-sans text-xs">
                              {isToday ? (
                                <div className="space-y-1.5">
                                  <p className="font-bold text-neutral-700">No link views logged yet for today ({todayDateStr}).</p>
                                  <p className="text-[11px] text-neutral-500">
                                    When buyers open your laptop listings or click direct share links today, their visits will appear here instantly.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (laptops.length > 0) handleCopyDirectLink(laptops[0].id);
                                    }}
                                    className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:underline font-bold pt-1 cursor-pointer"
                                  >
                                    <Link2 className="h-3.5 w-3.5" />
                                    <span>Copy a direct laptop link to share and test tracking</span>
                                  </button>
                                </div>
                              ) : (
                                <p>No model views recorded for {dateInfo.full}.</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comprehensive All-Laptops Performance Matrix */}
              <div className="bg-white border border-[#E5E5E5] overflow-hidden shadow-xs mt-8">
                <div className="p-5 border-b border-[#E5E5E5] bg-[#FAF9F9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="font-display font-bold text-sm text-[#111111] flex items-center space-x-2">
                      <Layers className="h-4 w-4 text-[#FF3B30]" />
                      <span>All-Inventory View Counter Matrix</span>
                    </h3>
                    <p className="font-sans text-xs text-[#6B6B6B] mt-0.5">
                      Compare today's present view count alongside historic windows for all active and archived catalog units.
                    </p>
                  </div>

                  <span className="font-mono text-[10px] bg-neutral-100 text-neutral-700 px-2.5 py-1 border border-neutral-200 font-bold">
                    {matrixLaptops.length} UNITS
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead className="bg-[#FAF9F9] border-b border-[#E5E5E5] font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                      <tr>
                        <th className="p-4 font-bold">Laptop Unit</th>
                        <th className="p-4 font-bold">Catalog Price</th>
                        <th className="p-4 font-bold bg-emerald-50 text-emerald-800 border-x border-emerald-200">
                          Today ({todayDateStr.substring(5)})
                        </th>
                        <th className="p-4 font-bold">Yesterday</th>
                        <th className="p-4 font-bold">Past 7 Days</th>
                        <th className="p-4 font-bold">Past 30 Days</th>
                        <th className="p-4 font-bold">All-Time Total</th>
                        <th className="p-4 font-bold text-right">Share Direct Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                      {matrixLaptops.map((laptop) => {
                        const todayViews = getLaptopTodayViews(laptop);
                        const yestViews = getLaptopViewsOnDate(laptop, yesterdayDateStr);
                        const sevenDayViews = last7DaysArr.reduce((s, d) => s + getLaptopViewsOnDate(laptop, d), 0);
                        const thirtyDayViews = last30DaysArr.reduce((s, d) => s + getLaptopViewsOnDate(laptop, d), 0);
                        const allTimeViews = laptop.viewCount || 0;

                        return (
                          <tr key={laptop.id} className="hover:bg-neutral-50/70 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={laptop.image}
                                  alt={laptop.name}
                                  className="w-10 h-8 object-cover border border-[#E5E5E5] flex-shrink-0"
                                />
                                <div>
                                  <span className="font-bold text-[#111111] block">
                                    {laptop.name}
                                  </span>
                                  <span className="font-mono text-[9px] text-[#6B6B6B] block">
                                    S/N: {laptop.serialNumber || 'N/A'} • {laptop.brand}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="p-4 font-mono font-bold text-[#111111]">
                              {formatNaira(laptop.price)}
                            </td>

                            {/* Today's Views Cell */}
                            <td className="p-4 bg-emerald-50/40 border-x border-emerald-200">
                              <div className="flex items-center space-x-1.5">
                                <span className={`px-2 py-0.5 font-mono text-xs font-bold flex items-center space-x-1 border ${
                                  todayViews > 0
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                                }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${todayViews > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300'}`} />
                                  <span>{todayViews}</span>
                                </span>
                              </div>
                            </td>

                            {/* Yesterday Cell */}
                            <td className="p-4 font-mono text-xs text-neutral-700">
                              {yestViews}
                            </td>

                            {/* 7 Days Cell */}
                            <td className="p-4 font-mono text-xs text-neutral-800 font-medium">
                              {sevenDayViews}
                            </td>

                            {/* 30 Days Cell */}
                            <td className="p-4 font-mono text-xs text-neutral-800">
                              {thirtyDayViews}
                            </td>

                            {/* All Time Total */}
                            <td className="p-4 font-mono text-xs font-bold text-blue-700">
                              <div className="flex items-center space-x-1">
                                <Eye className="h-3 w-3" />
                                <span>{allTimeViews}</span>
                              </div>
                            </td>

                            {/* Share Link Action */}
                            <td className="p-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleCopyDirectLink(laptop.id)}
                                className="inline-flex items-center space-x-1 bg-neutral-100 hover:bg-[#111111] hover:text-white text-[#111111] border border-neutral-300 px-2.5 py-1 text-[11px] font-sans font-bold transition-colors cursor-pointer"
                              >
                                {copiedLinkLaptopId === laptop.id ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Link2 className="h-3 w-3" />
                                    <span>Copy Link</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {matrixLaptops.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-neutral-500">
                            No matching laptops found for query "{analyticsSearch}".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* EDIT LAPTOP FULL BLEED VIEW */}
        {editingLaptop && (
          <div className="fixed inset-0 z-50 bg-[#FAF9F9] overflow-y-auto flex flex-col w-full h-full">
            {/* Header Sticky Full Bleed Bar */}
            <header className="sticky top-0 z-30 bg-white border-b border-[#E5E5E5] py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={clearEditDraft}
                  className="group flex items-center space-x-2 text-[#111111] hover:text-[#FF3B30] transition-colors cursor-pointer font-sans text-xs font-bold uppercase tracking-wider"
                >
                  <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Inventory</span>
                </button>
                <div className="h-4 w-px bg-neutral-300 hidden sm:block" />
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] text-[#FF3B30] uppercase font-bold tracking-widest flex items-center space-x-1">
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Listing</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={clearEditDraft}
                className="bg-neutral-100 hover:bg-[#FF3B30] text-[#111111] hover:text-white p-2 transition-colors cursor-pointer rounded-xs"
                title="Close Editor & Clear Draft"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Content Container */}
            <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 bg-white space-y-6">
              
              {/* Header info */}
                <div className="border-b border-[#E5E5E5] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="font-display font-bold text-xl text-[#111111]">
                      {editingLaptop.name}
                    </h2>
                    <p className="font-mono text-xs text-neutral-500 mt-1">
                      S/N: {editingLaptop.serialNumber} • ID: {editingLaptop.id}
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs text-blue-900 flex items-center space-x-1.5 w-fit">
                    <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="font-mono text-[10px]">Draft auto-saved across app switches</span>
                  </div>
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
                    <CustomMultiSelect
                      label="Primary Use Case(s)"
                      required
                      value={editForm.useCategory || ''}
                      options={USE_CASE_OPTIONS}
                      onChange={(val) => setEditForm((prev) => ({ ...prev, useCategory: val }))}
                      placeholder="-- Select Primary Use Case(s) --"
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
                        label="Storage Capacity"
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
                        label="Storage Type (SSD / HDD)"
                        required
                        value={editForm.specs?.storageType ?? editingLaptop?.specs?.storageType ?? 'SSD'}
                        options={STORAGE_TYPE_OPTIONS}
                        onChange={(val) => setEditForm((prev) => ({
                          ...prev,
                          specs: { ...(prev.specs || editForm.specs || { cpu: '', ram: '', storage: '', screen: '', graphics: '' }), storageType: val }
                        }))}
                        placeholder="-- Select Storage Type --"
                        customPlaceholder="Type custom storage type (SSD/HDD)..."
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

                {/* Section 3: Detailed Condition Description */}
                <div className="space-y-1.5 border border-[#E5E5E5] p-4 bg-white">
                  <label className="block font-sans text-xs font-bold text-neutral-700">
                    Detailed Condition Description
                  </label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Write a custom description explaining cosmetic scuffs, screen health, hinge quality, or charging items included..."
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                  />
                </div>

                {/* Section 4: Database Image Manager */}
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
                      {(() => {
                        const editDuplicateWarning = getDuplicateImageWarning(editDriveInput, editImages, editingLaptop?.id);
                        return (
                          <>
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
                                className={`flex-1 bg-white border px-2.5 py-1.5 font-sans text-xs text-[#111111] ${
                                  editDuplicateWarning
                                    ? 'border-amber-500 bg-amber-50/20 text-amber-950 focus:border-amber-600 ring-1 ring-amber-500/30'
                                    : 'border-[#E5E5E5]'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={handleAddEditDriveUrl}
                                className="px-3 py-1.5 bg-[#111111] hover:bg-[#222222] text-white font-mono text-xs font-bold shrink-0 cursor-pointer"
                              >
                                Add
                              </button>
                            </div>

                            {editDuplicateWarning && (
                              <div className="flex items-start space-x-2 p-2 bg-amber-50 border border-amber-300 text-amber-950 font-sans text-xs font-semibold rounded-xs">
                                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold">⚠️ Duplicate Image URL Detected</p>
                                  <p className="font-normal text-[11px] text-amber-800 mt-0.5">{editDuplicateWarning}</p>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
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
                    onClick={clearEditDraft}
                    className="px-4 py-2 border border-[#E5E5E5] hover:bg-neutral-100 font-mono text-xs font-bold text-neutral-700 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#FF3B30] hover:bg-[#D92D20] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
      )}

      </main>

      {/* MODAL 1: HOMEPAGE TESTIMONIAL EDITOR MODAL */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#E5E5E5] max-w-2xl w-full my-8 p-6 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-[#111111] flex items-center space-x-2">
                  <Star className="h-5 w-5 text-[#FF3B30] fill-[#FF3B30]" />
                  <span>{editingTestimonialId ? 'Edit & Moderate Testimonial' : 'Add Testimonial'}</span>
                </h3>
                <p className="font-sans text-xs text-[#6B6B6B] mt-0.5">
                  Manage testimonial details and control whether it is published live to the homepage.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsTestimonialModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-[#111111] hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {testiSubmittedByCustomer && (
              <div className="p-3 bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 uppercase">
                    Customer Submitted
                  </span>
                  <span className="font-sans text-xs text-blue-900 font-medium">
                    This review was submitted directly by a buyer from the storefront.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveTestimonialSubmit} className="space-y-5">
              {/* Publication Status Controls */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="font-sans text-xs font-bold text-[#111111] block">
                      Live on Homepage
                    </span>
                    <span className="font-sans text-[11px] text-neutral-500 block">
                      When enabled, this review is immediately visible in the Customer Stories section on the storefront.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={testiIsLive}
                    onChange={(e) => {
                      setTestiIsLive(e.target.checked);
                      if (e.target.checked) setTestiStatus('approved');
                      else setTestiStatus('hidden');
                    }}
                    className="accent-[#FF3B30] h-5 w-5 cursor-pointer ml-4"
                  />
                </label>
              </div>

              {/* Connect to Sold Laptop Selector */}
              <div>
                <label className="block font-sans text-xs font-bold text-[#111111] mb-1.5">
                  Link to Sold Laptop Record (Optional)
                </label>
                <select
                  value={testiSoldLaptopId}
                  onChange={(e) => handleSelectSoldLaptopForTestimonial(e.target.value)}
                  className="w-full bg-white border border-[#E5E5E5] p-2.5 font-sans text-xs text-[#111111] focus:outline-none focus:border-[#FF3B30]"
                >
                  <option value="">-- Custom / Not Linked to Sold Laptop --</option>
                  {soldLaptops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (S/N: {s.serialNumber}) - Buyer: {s.buyerName || 'Client'}
                    </option>
                  ))}
                </select>
                <span className="font-mono text-[10px] text-neutral-500 mt-1 block">
                  Selecting a sold laptop will auto-link the unit model and feedback text.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-bold text-[#111111] mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={testiName}
                    onChange={(e) => setTestiName(e.target.value)}
                    placeholder="e.g. Victor O."
                    className="w-full border border-[#E5E5E5] p-2.5 font-sans text-xs text-[#111111] focus:outline-none focus:border-[#FF3B30]"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-bold text-[#111111] mb-1">
                    Role / Location / Tag
                  </label>
                  <input
                    type="text"
                    value={testiRole}
                    onChange={(e) => setTestiRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer, Victoria Island"
                    className="w-full border border-[#E5E5E5] p-2.5 font-sans text-xs text-[#111111] focus:outline-none focus:border-[#FF3B30]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-[#111111] mb-1">
                  Workstation Laptop Model *
                </label>
                <input
                  type="text"
                  required
                  value={testiLaptopBought}
                  onChange={(e) => setTestiLaptopBought(e.target.value)}
                  placeholder="e.g. MacBook Pro 16 M1 Max"
                  className="w-full border border-[#E5E5E5] p-2.5 font-sans text-xs text-[#111111] focus:outline-none focus:border-[#FF3B30]"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-[#111111] mb-1">
                  Client Review Quote *
                </label>
                <textarea
                  required
                  rows={3}
                  value={testiQuote}
                  onChange={(e) => setTestiQuote(e.target.value)}
                  placeholder="Write the review or feedback quote here..."
                  className="w-full border border-[#E5E5E5] p-2.5 font-sans text-xs text-[#111111] focus:outline-none focus:border-[#FF3B30]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block font-sans text-xs font-bold text-[#111111] mb-1">
                    Star Rating (1 - 5 Stars)
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTestiRating(star)}
                        className="p-1 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star className={`h-6 w-6 ${star <= testiRating ? 'fill-[#FF3B30] text-[#FF3B30]' : 'text-neutral-300'}`} />
                      </button>
                    ))}
                    <span className="font-mono text-xs font-bold ml-2 text-neutral-700">{testiRating} / 5</span>
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-bold text-[#111111] mb-1">
                    Verified Purchase Badge
                  </label>
                  <button
                    type="button"
                    onClick={() => setTestiVerified(!testiVerified)}
                    className={`px-3 py-2 border font-sans text-xs font-bold flex items-center space-x-2 cursor-pointer transition-colors ${
                      testiVerified ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-neutral-100 border-[#E5E5E5] text-neutral-600'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>{testiVerified ? 'Verified Purchase (Active)' : 'Unverified Buyer'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-[#111111] mb-1">
                  Client Avatar Image URL
                </label>
                <input
                  type="text"
                  value={testiAvatar}
                  onChange={(e) => setTestiAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border border-[#E5E5E5] p-2.5 font-sans text-xs text-[#111111] focus:outline-none focus:border-[#FF3B30]"
                />
              </div>

              {/* Private Customer Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
                <div>
                  <label className="block font-sans text-[11px] font-bold text-neutral-600 mb-1">
                    Customer Phone / WhatsApp (Private to Admin)
                  </label>
                  <input
                    type="text"
                    value={testiCustomerPhone}
                    onChange={(e) => setTestiCustomerPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full border border-[#E5E5E5] p-2 font-sans text-xs text-[#111111] focus:outline-none focus:border-[#FF3B30]"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] font-bold text-neutral-600 mb-1">
                    Customer Email (Private to Admin)
                  </label>
                  <input
                    type="email"
                    value={testiCustomerEmail}
                    onChange={(e) => setTestiCustomerEmail(e.target.value)}
                    placeholder="e.g. client@gmail.com"
                    className="w-full border border-[#E5E5E5] p-2 font-sans text-xs text-[#111111] focus:outline-none focus:border-[#FF3B30]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E5E5] hover:bg-neutral-100 font-sans text-xs font-bold text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#FF3B30] hover:bg-[#D32F2F] text-white font-sans text-xs font-bold cursor-pointer transition-colors flex items-center space-x-1.5"
                >
                  <Star className="h-4 w-4 fill-current" />
                  <span>
                    {testiIsLive
                      ? (editingTestimonialId ? 'Save & Update Live Testimonial' : 'Publish Live to Homepage')
                      : 'Save in Archive (Draft / Offline)'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SOLD LAPTOP REVIEW MODAL */}
      {editingSoldLaptop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E5E5E5] max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div>
                <h3 className="font-display font-bold text-sm text-[#111111]">
                  Edit Sold Laptop Review
                </h3>
                <p className="font-mono text-[10px] text-neutral-500 mt-0.5">
                  {editingSoldLaptop.name} (S/N: {editingSoldLaptop.serialNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSoldLaptop(null)}
                className="p-1.5 text-neutral-400 hover:text-[#111111]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSoldLaptopReview} className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-bold text-[#111111] mb-1">
                  Buyer / Client Name
                </label>
                <input
                  type="text"
                  value={editBuyerName}
                  onChange={(e) => setEditBuyerName(e.target.value)}
                  placeholder="e.g. Oluwaseun A."
                  className="w-full border border-[#E5E5E5] p-2.5 font-sans text-xs text-[#111111] focus:outline-none focus:border-[#FF3B30]"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-[#111111] mb-1">
                  Delivered Tag / Date
                </label>
                <input
                  type="text"
                  value={editDeliveredDate}
                  onChange={(e) => setEditDeliveredDate(e.target.value)}
                  placeholder="e.g. DELIVERED MARCH 2026"
                  className="w-full border border-[#E5E5E5] p-2.5 font-sans text-xs text-[#111111] focus:outline-none focus:border-[#FF3B30]"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-[#111111] mb-1">
                  Buyer Review / Feedback
                </label>
                <textarea
                  rows={3}
                  value={editBuyerFeedback}
                  onChange={(e) => setEditBuyerFeedback(e.target.value)}
                  placeholder="Enter feedback review provided by buyer..."
                  className="w-full border border-[#E5E5E5] p-2.5 font-sans text-xs text-[#111111] focus:outline-none focus:border-[#FF3B30]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setEditingSoldLaptop(null)}
                  className="px-4 py-2 border border-[#E5E5E5] hover:bg-neutral-100 font-sans text-xs font-bold text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#111111] hover:bg-[#FF3B30] text-white font-sans text-xs font-bold cursor-pointer transition-colors"
                >
                  Save Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* Footer copyright inside standalone container */}
        <footer className="border-t border-[#E5E5E5] py-5 px-6 text-center font-mono text-[9px] text-neutral-400 bg-neutral-50/50">
          © 2026 Rightware Laptops Staff Portal. All diagnostics and serial records are encrypted.
        </footer>

      </div>
    </div>
  );
}
