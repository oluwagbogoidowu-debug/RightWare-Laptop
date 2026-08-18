import React, { useState } from 'react';
import { Laptop, Testimonial } from '../types';
import { submitCustomerReviewToFirestore } from '../lib/firebaseService';
import { X, Star, Upload, CheckCircle2, ShieldCheck, Laptop as LaptopIcon, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  allLaptops: Laptop[];
  soldLaptops: Laptop[];
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200'
];

export default function CustomerReviewModal({
  isOpen,
  onClose,
  allLaptops,
  soldLaptops
}: CustomerReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Selected laptop from list vs custom typed
  const [isCustomLaptop, setIsCustomLaptop] = useState(false);
  const [selectedSoldLaptopId, setSelectedSoldLaptopId] = useState('');
  const [customLaptopName, setCustomLaptopName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Combine sold and active laptops for the dropdown
  const allAvailableSold = [...soldLaptops, ...allLaptops];

  const handleRatingText = (r: number) => {
    switch (r) {
      case 5: return '5 Stars - Outstanding & Highly Recommended';
      case 4: return '4 Stars - Very Satisfied & Good Quality';
      case 3: return '3 Stars - Satisfactory';
      case 2: return '2 Stars - Fair Experience';
      case 1: return '1 Star - Needs Improvement';
      default: return '';
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image file must be smaller than 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'rightware_laptops');

      // Upload directly or convert to optimized base64 data URL
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setAvatar(base64);
        setCustomAvatarUrl(base64);
        setIsUploadingPhoto(false);
      };
      reader.onerror = () => {
        setErrorMessage('Failed to read image file.');
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Error handling avatar upload:', err);
      setErrorMessage('Failed to process image. You may select a default avatar.');
      setIsUploadingPhoto(false);
    }
  };

  const handleSelectLaptopFromList = (laptopId: string) => {
    setSelectedSoldLaptopId(laptopId);
    if (laptopId === 'custom') {
      setIsCustomLaptop(true);
      setCustomLaptopName('');
    } else {
      setIsCustomLaptop(false);
      const found = allAvailableSold.find(l => l.id === laptopId);
      if (found) {
        setCustomLaptopName(found.name);
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    if (!quote.trim() || quote.trim().length < 10) {
      setErrorMessage('Please share a brief review of your laptop and buying experience (at least 10 characters).');
      return;
    }

    const laptopBoughtFinal = isCustomLaptop
      ? customLaptopName.trim()
      : (allAvailableSold.find(l => l.id === selectedSoldLaptopId)?.name || customLaptopName.trim() || 'Workstation Laptop');

    if (!laptopBoughtFinal) {
      setErrorMessage('Please specify or select the laptop model you purchased.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitCustomerReviewToFirestore({
        name: name.trim(),
        role: role.trim() || 'Verified Buyer',
        quote: quote.trim(),
        rating,
        avatar: customAvatarUrl.trim() || avatar,
        verifiedPurchase: true,
        laptopBought: laptopBoughtFinal,
        soldLaptopId: (!isCustomLaptop && selectedSoldLaptopId && selectedSoldLaptopId !== 'custom') ? selectedSoldLaptopId : undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
      });

      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setErrorMessage('Failed to submit review. Please try again or check your internet connection.');
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmittedSuccess(false);
    setName('');
    setRole('');
    setQuote('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomLaptopName('');
    setSelectedSoldLaptopId('');
    setIsCustomLaptop(false);
    setRating(5);
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white border border-[#E5E5E5] shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E5E5E5] bg-[#FAF9F9]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center justify-center text-[#FF3B30]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-[#111111]">
                  Share Your Experience
                </h3>
                <p className="font-sans text-xs text-[#6B6B6B]">
                  Bought a laptop from Rightware? Tell others how it performs.
                </p>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="text-neutral-400 hover:text-[#111111] p-1.5 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Success Screen */}
          {isSubmittedSuccess ? (
            <div className="p-8 sm:p-10 text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="font-display font-bold text-xl text-[#111111]">
                  Thank You, {name}!
                </h4>
                <p className="font-sans text-xs sm:text-sm text-[#444444] leading-relaxed">
                  Your review for <strong className="text-[#111111]">{isCustomLaptop ? customLaptopName : (allAvailableSold.find(l => l.id === selectedSoldLaptopId)?.name || customLaptopName || 'your laptop')}</strong> has been submitted.
                </p>
                <div className="bg-amber-50 border border-amber-200 p-3 mt-4 text-left">
                  <p className="font-sans text-[11px] text-amber-900 leading-relaxed flex items-start space-x-2">
                    <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Verification Notice:</strong> Your review has been saved in our archive for verification. It will appear live on the Rightware Laptops homepage once verified by our store team.
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="bg-[#111111] hover:bg-black text-white font-sans text-xs font-bold px-8 py-3 transition-colors cursor-pointer"
                >
                  Done & Back to Store
                </button>
              </div>
            </div>
          ) : (
            /* Review Form */
            <form onSubmit={handleSubmitReview} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 p-3 flex items-start space-x-2.5 text-rose-800 text-xs">
                  <AlertCircle className="h-4 w-4 text-[#FF3B30] shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Rating Selector */}
              <div className="space-y-2">
                <label className="block font-sans text-xs font-bold text-[#111111]">
                  1. How would you rate your laptop & experience? *
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 bg-neutral-50 border border-[#E5E5E5] p-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-neutral-300 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              isFilled
                                ? 'fill-[#FF3B30] text-[#FF3B30]'
                                : 'text-neutral-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="font-sans text-xs font-semibold text-[#111111] pl-2">
                    {handleRatingText(hoverRating || rating)}
                  </span>
                </div>
              </div>

              {/* 2. Laptop Bought Selection */}
              <div className="space-y-2">
                <label className="block font-sans text-xs font-bold text-[#111111] flex items-center justify-between">
                  <span>2. Which Laptop did you purchase? *</span>
                  <button
                    type="button"
                    onClick={() => setIsCustomLaptop(!isCustomLaptop)}
                    className="font-mono text-[10px] text-[#FF3B30] hover:underline cursor-pointer"
                  >
                    {isCustomLaptop ? 'Select from store list' : 'Model not listed? Type custom name'}
                  </button>
                </label>

                {!isCustomLaptop ? (
                  <div className="space-y-2">
                    <select
                      value={selectedSoldLaptopId}
                      onChange={(e) => handleSelectLaptopFromList(e.target.value)}
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2.5 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111] cursor-pointer"
                    >
                      <option value="">-- Choose your laptop model from inventory / sold list --</option>
                      {allAvailableSold.map((laptop) => (
                        <option key={laptop.id} value={laptop.id}>
                          {laptop.name} {laptop.isSold ? '(Sold Unit)' : ''} — ₦{laptop.price.toLocaleString()} (S/N: {laptop.serialNumber})
                        </option>
                      ))}
                      <option value="custom">✍️ My model is not listed (Type manually)</option>
                    </select>

                    {selectedSoldLaptopId && selectedSoldLaptopId !== 'custom' && (
                      <div className="p-3 bg-neutral-50 border border-[#E5E5E5] flex items-center space-x-3">
                        {allAvailableSold.find(l => l.id === selectedSoldLaptopId)?.image && (
                          <img
                            src={allAvailableSold.find(l => l.id === selectedSoldLaptopId)?.image}
                            alt="Selected"
                            className="w-12 h-10 object-cover border border-[#E5E5E5] filter grayscale shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-sans font-bold text-xs text-[#111111] truncate">
                            {allAvailableSold.find(l => l.id === selectedSoldLaptopId)?.name}
                          </p>
                          <p className="font-mono text-[10px] text-[#6B6B6B]">
                            Verified with Rightware 45-Point Engineer Inspection Passed
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      required
                      value={customLaptopName}
                      onChange={(e) => setCustomLaptopName(e.target.value)}
                      placeholder="e.g., Lenovo ThinkPad T480s (Core i7, 16GB RAM) or MacBook Pro 14 M1"
                      className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                    />
                  </div>
                )}
              </div>

              {/* 3. Review Story & Details */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-bold text-[#111111]">
                  3. Your Review & Feedback *
                </label>
                <textarea
                  required
                  rows={3}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Share details on performance, battery backup, cosmetic condition, testing verification, and overall satisfaction..."
                  className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                />
              </div>

              {/* 4. Customer Info (Name, Role/Location) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-xs font-bold text-[#111111] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Femi Adebayo"
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-bold text-[#111111] mb-1">
                    Your Profession or City
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., Software Engineer, Lagos or Student, UNILAG"
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-2 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* 5. Avatar / Photo Selector */}
              <div className="space-y-2 pt-1 border-t border-[#F0F0F0]">
                <label className="block font-sans text-xs font-bold text-[#111111]">
                  Customer Photo / Profile Picture
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_AVATARS.map((presetUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(presetUrl);
                        setCustomAvatarUrl('');
                      }}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        avatar === presetUrl && !customAvatarUrl
                          ? 'border-[#FF3B30] scale-110 shadow-xs'
                          : 'border-[#E5E5E5] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={presetUrl} alt="Preset" className="w-full h-full object-cover filter grayscale" />
                    </button>
                  ))}

                  {/* Upload custom picture button */}
                  <label className="inline-flex items-center space-x-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 border border-[#E5E5E5] font-sans text-xs text-[#111111] font-semibold cursor-pointer transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isUploadingPhoto ? 'Uploading...' : 'Upload My Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={isUploadingPhoto}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* 6. Optional Contact Details for Verification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#F0F0F0]">
                <div>
                  <label className="block font-sans text-[11px] font-semibold text-neutral-600 mb-1">
                    WhatsApp / Phone (Private, for order verification)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="080 1234 5678"
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-1.5 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block font-sans text-[11px] font-semibold text-neutral-600 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white border border-[#E5E5E5] px-3 py-1.5 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* Archive notice */}
              <div className="p-3 bg-neutral-50 border border-dashed border-[#E5E5E5] text-[11px] font-sans text-[#6B6B6B] flex items-start space-x-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Moderation Policy:</strong> Submissions are placed in the admin archive for verification and polish before going live on the homepage to prevent spam and protect buyer privacy.
                </span>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 border border-[#E5E5E5] hover:bg-neutral-50 text-neutral-700 font-sans text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FF3B30] hover:bg-[#D32F2F] disabled:bg-neutral-400 text-white font-sans text-xs font-bold px-6 py-2.5 transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>{isSubmitting ? 'Submitting to Archive...' : 'Submit Review'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
