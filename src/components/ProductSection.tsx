import React from 'react';
import { Laptop, FilterState, LaptopCondition } from '../types';
import { Search, RotateCcw, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';

interface ProductSectionProps {
  laptops: Laptop[];
  filters: FilterState;
  onUpdateFilters: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onSelectLaptop: (laptop: Laptop) => void;
}

export default function ProductSection({
  laptops,
  filters,
  onUpdateFilters,
  onResetFilters,
  onSelectLaptop
}: ProductSectionProps) {

  const getConditionColor = (cond: LaptopCondition) => {
    switch (cond) {
      case 'Very Clean': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Clean': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Good': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  const isFiltered = filters.brand !== 'all' || filters.budget !== 'all' || filters.use !== 'all' || filters.searchQuery !== '';

  return (
    <section id="available-laptops" className="py-16 sm:py-24 bg-[#F7F7F7] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block with Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E5E5E5]">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[#FF3B30] font-bold">
              Verified Collection
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#111111] mt-2 tracking-tight">
              Available Units Instock
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#6B6B6B] mt-1">
              Guaranteed genuine parts. Click any laptop to inspect battery diagnostics, full specs, and secure a reservation.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Search specs, models (M1, i7, RAM...)"
              value={filters.searchQuery}
              onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
              className="w-full bg-white border border-[#E5E5E5] pl-10 pr-4 py-2.5 font-sans text-xs text-[#111111] focus:outline-hidden focus:border-[#111111]"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onUpdateFilters({ searchQuery: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-mono text-[#6B6B6B] hover:text-[#111111]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filters Quick bar & Reset Action */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Brand Filter */}
            <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 border border-[#E5E5E5] text-xs">
              <span className="text-[#6B6B6B]">Brand:</span>
              <select
                value={filters.brand}
                onChange={(e) => onUpdateFilters({ brand: e.target.value as any })}
                className="font-sans font-bold text-[#111111] focus:outline-hidden bg-transparent"
              >
                <option value="all">All Brands</option>
                <option value="Apple">Apple</option>
                <option value="Lenovo">Lenovo</option>
                <option value="Dell">Dell</option>
                <option value="HP">HP</option>
              </select>
            </div>

            {/* Use Filter */}
            <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 border border-[#E5E5E5] text-xs">
              <span className="text-[#6B6B6B]">Use:</span>
              <select
                value={filters.use}
                onChange={(e) => onUpdateFilters({ use: e.target.value as any })}
                className="font-sans font-bold text-[#111111] focus:outline-hidden bg-transparent"
              >
                <option value="all">All Uses</option>
                <option value="School">School</option>
                <option value="Work">Work</option>
                <option value="Design">Design</option>
              </select>
            </div>

            {/* Budget Filter */}
            <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 border border-[#E5E5E5] text-xs">
              <span className="text-[#6B6B6B]">Budget:</span>
              <select
                value={filters.budget}
                onChange={(e) => onUpdateFilters({ budget: e.target.value as any })}
                className="font-sans font-bold text-[#111111] focus:outline-hidden bg-transparent"
              >
                <option value="all">Any Budget</option>
                <option value="under-400">Under $400</option>
                <option value="400-700">$400 - $700</option>
                <option value="700-1000">$700 - $1000</option>
                <option value="above-1000">$1000+</option>
              </select>
            </div>

          </div>

          {/* Reset Buttons */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="font-mono text-xs text-[#FF3B30] hover:text-[#FF3B30]/80 font-bold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Catalog Filters</span>
            </button>
          )}
        </div>

        {/* Laptop Catalog Grid */}
        {laptops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {laptops.map((laptop) => (
              <div
                key={laptop.id}
                onClick={() => onSelectLaptop(laptop)}
                className="group bg-white border border-[#E5E5E5] p-3 flex flex-col justify-between hover:border-[#111111] transition-all duration-300 cursor-pointer relative"
              >
                <div>
                  {/* Laptop Visual Card Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F7F7F7] border border-[#E5E5E5]">
                    <img
                      src={laptop.image}
                      alt={laptop.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 filter grayscale-[0.1]"
                    />

                    {/* Highly Controlled Red Urgency Tag (Low Stock) */}
                    {laptop.stockCount <= 2 && (
                      <div className="absolute top-2 left-2 bg-[#FF3B30] text-white text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 flex items-center space-x-1 shadow-sm">
                        <Tag className="h-2.5 w-2.5 fill-white" />
                        <span>{laptop.stockCount === 1 ? 'ONLY 1 LEFT' : '2 UNITS LEFT'}</span>
                      </div>
                    )}

                    {/* Standard checked pass watermark */}
                    {laptop.inspectionPassed && (
                      <div className="absolute bottom-2 right-2 bg-[#111111]/80 text-white text-[8px] font-mono tracking-widest px-1.5 py-0.5 flex items-center space-x-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        <span>VERIFIED</span>
                      </div>
                    )}
                  </div>

                  {/* Identification and conditions */}
                  <div className="mt-3 flex justify-between items-start gap-1">
                    <div>
                      <h3 className="font-display font-bold text-sm text-[#111111] group-hover:text-[#FF3B30] transition-colors line-clamp-1">
                        {laptop.name}
                      </h3>
                      <p className="font-mono text-[10px] text-[#6B6B6B] mt-0.5">
                        Year: {laptop.year} • {laptop.brand}
                      </p>
                    </div>
                    
                    {/* Condition badge */}
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border flex-shrink-0 ${getConditionColor(laptop.condition)}`}>
                      {laptop.condition}
                    </span>
                  </div>

                  {/* Specifications Snippet */}
                  <div className="mt-3 bg-[#F7F7F7] p-2 text-[10px] space-y-1 border border-dashed border-[#E5E5E5]">
                    <p className="font-sans text-[#111111] truncate">
                      <strong className="text-neutral-500 font-mono font-medium">CPU:</strong> {laptop.specs.cpu.split('(')[0]}
                    </p>
                    <p className="font-sans text-[#111111] truncate">
                      <strong className="text-neutral-500 font-mono font-medium">MEM:</strong> {laptop.specs.ram} • {laptop.specs.storage}
                    </p>
                  </div>
                </div>

                {/* Sub-Footer inside card */}
                <div className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-[#6B6B6B] uppercase tracking-wider">Verified Price</span>
                    <span className="font-mono text-base font-extrabold text-[#FF3B30] mt-0.5 leading-none">
                      ${laptop.price}
                    </span>
                  </div>
                  
                  {/* Battery summary note */}
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono text-[#6B6B6B] uppercase tracking-wider">Battery Check</span>
                    <span className="font-mono text-[10px] font-bold text-[#111111] mt-0.5 flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-1 py-0.5">
                      <span>{laptop.batteryHealth}% Health</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Catalog Filter State */
          <div className="bg-white border border-[#E5E5E5] py-16 px-4 text-center mt-10 max-w-xl mx-auto">
            <AlertTriangle className="h-8 w-8 text-[#FF3B30] mx-auto" />
            <h3 className="font-display font-bold text-lg text-[#111111] mt-3">
              No Verified Laptops Match
            </h3>
            <p className="font-sans text-xs text-[#6B6B6B] mt-1.5 max-w-sm mx-auto leading-relaxed">
              We currently do not have stock that matches all your filter requirements simultaneously. Try relaxing your budget or brand constraints.
            </p>
            <button
              onClick={onResetFilters}
              className="bg-[#111111] hover:bg-[#111111]/90 text-white font-sans text-xs px-5 py-2.5 mt-5 font-medium cursor-pointer"
            >
              Reset All Search Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
