import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db } from '../firebase';
import { ACTIVE_LAPTOPS, SOLD_LAPTOPS, TESTIMONIALS } from '../data';
import { Laptop, Testimonial } from '../types';

export interface ReservationData {
  laptopId: string;
  laptopName: string;
  serialNumber: string;
  price: number;
  userName: string;
  userPhone: string;
  userLocation: string;
  createdAt?: any;
}

// Seed Initial Data into Firestore if collections are empty
export async function seedInitialDataIfNeeded() {
  try {
    const laptopCol = collection(db, 'laptops');
    const laptopSnap = await getDocs(laptopCol);

    if (laptopSnap.empty) {
      console.log('Seeding initial laptop inventory into Firestore...');
      const allInitialLaptops = [...ACTIVE_LAPTOPS, ...SOLD_LAPTOPS];
      for (const laptop of allInitialLaptops) {
        await setDoc(doc(db, 'laptops', laptop.id), laptop);
      }
      console.log('Laptop inventory seeded successfully.');
    }

    const testimonialCol = collection(db, 'testimonials');
    const testimonialSnap = await getDocs(testimonialCol);

    if (testimonialSnap.empty) {
      console.log('Seeding initial testimonials into Firestore...');
      for (const item of TESTIMONIALS) {
        await setDoc(doc(db, 'testimonials', item.id), item);
      }
      console.log('Testimonials seeded successfully.');
    }
  } catch (err) {
    console.error('Error during Firestore seeding:', err);
  }
}

// Subscribe to real-time Laptop collection changes
export function subscribeLaptops(onData: (laptops: Laptop[]) => void) {
  const laptopCol = collection(db, 'laptops');
  return onSnapshot(laptopCol, (snapshot) => {
    const list: Laptop[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Laptop);
    });
    onData(list);
  }, (err) => {
    console.error('Error subscribing to laptops:', err);
  });
}

// Add or update a laptop in Firestore
export async function saveLaptopToFirestore(laptop: Laptop) {
  const docRef = doc(db, 'laptops', laptop.id);
  await setDoc(docRef, laptop, { merge: true });
}

// Delete a laptop from Firestore
export async function deleteLaptopFromFirestore(laptopId: string) {
  const docRef = doc(db, 'laptops', laptopId);
  await deleteDoc(docRef);
}

// Helper to get YYYY-MM-DD in local time
export function getTodayDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Increment laptop site view count (when visitors view details on site or open direct link)
export async function trackLaptopView(laptopId: string) {
  if (!laptopId) return;
  try {
    const today = getTodayDateString();
    const docRef = doc(db, 'laptops', laptopId);
    
    // Update individual laptop overall viewCount and today's dailyViews count atomically
    await setDoc(docRef, {
      viewCount: increment(1),
      dailyViews: {
        [today]: increment(1)
      }
    }, { merge: true });

    // Also record in daily_views collection for date-aggregated analytics
    const dailyRef = doc(db, 'daily_views', today);
    await setDoc(dailyRef, {
      date: today,
      totalViews: increment(1),
      lastUpdated: serverTimestamp(),
      laptops: {
        [laptopId]: increment(1)
      }
    }, { merge: true });
  } catch (err) {
    console.error('Error tracking laptop view:', err);
  }
}

// Subscribe to Daily Views collection
export function subscribeDailyViews(onData: (dailyViews: any[]) => void) {
  const colRef = collection(db, 'daily_views');
  return onSnapshot(colRef, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    list.sort((a, b) => b.id.localeCompare(a.id));
    onData(list);
  }, (err) => {
    console.error('Error subscribing to daily views:', err);
  });
}

// Create a physical inspection reservation/hold
export async function createReservationInFirestore(reservation: ReservationData) {
  const colRef = collection(db, 'reservations');
  const docRef = await addDoc(colRef, {
    ...reservation,
    createdAt: serverTimestamp(),
    status: 'pending'
  });
  return docRef.id;
}

// Subscribe to Reservations in real time
export function subscribeReservations(onData: (reservations: any[]) => void) {
  const colRef = collection(db, 'reservations');
  return onSnapshot(colRef, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort newest first if createdAt exists
    list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    onData(list);
  }, (err) => {
    console.error('Error subscribing to reservations:', err);
  });
}

// Subscribe to Testimonials
export function subscribeTestimonials(onData: (testimonials: Testimonial[]) => void) {
  const colRef = collection(db, 'testimonials');
  return onSnapshot(colRef, (snapshot) => {
    const list: Testimonial[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Testimonial);
    });
    onData(list);
  }, (err) => {
    console.error('Error subscribing to testimonials:', err);
  });
}

// Add or update a testimonial in Firestore
export async function saveTestimonialToFirestore(testimonial: Testimonial) {
  const docRef = doc(db, 'testimonials', testimonial.id);
  await setDoc(docRef, testimonial, { merge: true });
}

// Submit a new customer review (defaults to pending approval and not live)
export async function submitCustomerReviewToFirestore(review: Partial<Testimonial> & { name: string; quote: string; rating: number; laptopBought: string }) {
  const id = review.id || `cust_review_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const fullReview: Testimonial = {
    id,
    name: review.name.trim(),
    role: review.role?.trim() || 'Verified Buyer',
    quote: review.quote.trim(),
    rating: review.rating || 5,
    avatar: review.avatar?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    verifiedPurchase: true,
    laptopBought: review.laptopBought.trim(),
    soldLaptopId: review.soldLaptopId || undefined,
    isLive: false, // Must be reviewed/edited in admin archive before going live
    status: 'pending',
    submittedByCustomer: true,
    createdAt: Date.now(),
    customerEmail: review.customerEmail?.trim() || undefined,
    customerPhone: review.customerPhone?.trim() || undefined,
  };
  const docRef = doc(db, 'testimonials', id);
  await setDoc(docRef, fullReview, { merge: true });
  return fullReview;
}

// Update testimonial live/approval status
export async function updateTestimonialStatus(testimonialId: string, isLive: boolean, status: 'approved' | 'pending' | 'hidden') {
  const docRef = doc(db, 'testimonials', testimonialId);
  await updateDoc(docRef, { isLive, status });
}

// Delete a testimonial from Firestore
export async function deleteTestimonialFromFirestore(testimonialId: string) {
  const docRef = doc(db, 'testimonials', testimonialId);
  await deleteDoc(docRef);
}
