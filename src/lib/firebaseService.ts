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
  serverTimestamp 
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
