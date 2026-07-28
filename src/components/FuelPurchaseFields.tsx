"use client";

import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/formatters";

type LoadOption = {
  id: string;
  label: string;
};

type FuelPurchaseDefaults = {
  fuelDate?: string;
  gallons?: number;
  pricePerGallon?: number;
  vendor?: string;
  location?: string;
  state?: string;
  odometer?: number;
  receiptReference?: string;
  loadId?: string;
  notes?: string;
};

export function FuelPurchaseFields({
  loads,
  defaults = {},
}: {
  loads: LoadOption[];
  defaults?: FuelPurchaseDefaults;
}) {
  const [gallons, setGallons] = useState(defaults.gallons?.toString() ?? "");
  const [pricePerGallon, setPricePerGallon] = useState(defaults.pricePerGallon?.toString() ?? "");
  const estimatedTotal = useMemo(() => {
    const parsedGallons = Number.parseFloat(gallons);
    const parsedPrice = Number.parseFloat(pricePerGallon);

    return Number.isFinite(parsedGallons) && parsedGallons > 0 && Number.isFinite(parsedPrice) && parsedPrice > 0
      ? parsedGallons * parsedPrice
      : null;
  }, [gallons, pricePerGallon]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-[#324761]">
          Fuel date
          <input name="fuelDate" type="date" required className="input" defaultValue={defaults.fuelDate} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-[#324761]">
          Vendor or truck stop
          <input name="vendor" className="input" placeholder="Vendor name" defaultValue={defaults.vendor} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-[#324761]">
          Gallons
          <input
            name="gallons"
            type="number"
            min="0.001"
            step="0.001"
            required
            className="input"
            inputMode="decimal"
            value={gallons}
            onChange={(event) => setGallons(event.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-[#324761]">
          Price per gallon
          <input
            name="pricePerGallon"
            type="number"
            min="0.001"
            step="0.001"
            required
            className="input"
            inputMode="decimal"
            value={pricePerGallon}
            onChange={(event) => setPricePerGallon(event.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-[#324761]">
          City or location
          <input name="location" className="input" placeholder="City or stop location" defaultValue={defaults.location} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-[#324761]">
          State
          <input
            name="state"
            className="input"
            placeholder="State"
            maxLength={2}
            autoCapitalize="characters"
            defaultValue={defaults.state}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-[#324761]">
          Odometer
          <input
            name="odometer"
            type="number"
            min="0"
            step="1"
            className="input"
            inputMode="numeric"
            defaultValue={defaults.odometer}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-[#324761]">
          Load association
          <select name="loadId" className="input" defaultValue={defaults.loadId ?? ""}>
            <option value="">No load association</option>
            {loads.map((load) => (
              <option key={load.id} value={load.id}>
                {load.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-[#324761] md:col-span-2">
          Receipt reference
          <input
            name="receiptReference"
            className="input"
            placeholder="Optional path, receipt number, or folder tag"
            defaultValue={defaults.receiptReference}
          />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-medium text-[#324761]">
        Notes
        <textarea name="notes" rows={3} className="input" placeholder="Fuel, route, or record notes" defaultValue={defaults.notes} />
      </label>

      <output className="rounded-lg border border-[#b8d2f4] bg-[#eef6ff] p-3 text-sm text-[#324761]" aria-live="polite">
        Calculated fuel expense: <strong className="text-[#0a2342]">{estimatedTotal === null ? "Enter gallons and price" : formatCurrency(estimatedTotal)}</strong>
      </output>
    </div>
  );
}

