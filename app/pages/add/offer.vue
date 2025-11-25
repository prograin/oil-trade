<template>
  <main id="offerModal" class="flex max-w-full items-center justify-center p-4 sm:p-6 w-full">
    <div class="bg-gray-800 p-8 rounded relative max-w-2xl">
      <h2 class="font-semibold text-yellow-400 mb-4">Add Offer</h2>

      <form class="space-y-6 space-x-3">
        <!-- Document Type -->
        <div class="flex-item-field">
          <label class="block text-gray-300 text-sm mb-1">Document Type</label>
          <select class="p-2 rounded text-black w-full bg-gray-100">
            <optgroup label="Buy-Side (Request)">
              <option>RFQ – Request for Quotation</option>
              <option>LOI – Letter of Intent</option>
              <option>ICPO – Irrevocable Corporate Purchase Order (Draft)</option>
            </optgroup>
            <optgroup label="Sell-Side (Offer)">
              <option selected>Availability Notice – Sales Offer (SCO)</option>
              <option>Spot Cargo Offer</option>
              <option>Term Contract Proposal</option>
            </optgroup>
            <optgroup label="Other">
              <option>EOI – Expression of Interest</option>
              <option>Term Sheet</option>
            </optgroup>
          </select>
        </div>

        <!-- Product -->
        <div class="flex-item-field">
          <label class="text-gray-300 text-sm mb-1">Product</label>
          <select class="p-2 rounded text-black w-full bg-gray-100">
            <option>Light Crude Oil</option>
            <option>Heavy Crude Oil</option>
            <option>Super Heavy Crude Oil</option>
          </select>
        </div>

        <!-- Specification -->
        <div class="flex-item-field sm:flex-row gap-4">
          <div class="flex-1 flex flex-col">
            <label class="text-gray-300 text-sm mb-1">API</label>
            <input type="number" step="0.1" min="0" placeholder="34.0" class="p-2 rounded text-black w-full bg-gray-100" />
          </div>
          <div class="flex-1 flex flex-col">
            <label class="text-gray-300 text-sm mb-1">Sulfur</label>
            <input type="number" step="0.01" min="0" max="5" placeholder="1.2" class="p-2 rounded text-black w-full bg-gray-100" />
          </div>
        </div>

        <!-- Quantity and Deal Type -->
        <div class="grid grid-cols-1 mx-0 sm:grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label class="text-gray-300 text-sm mb-1">Quantity</label>
            <select class="p-2 rounded text-black w-full bg-gray-100">
              <option>500,000 BBL (Handysize)</option>
              <option>700,000 BBL (Panamax)</option>
              <option>1,000,000 BBL (Suezmax)</option>
              <option>2,000,000 BBL (VLCC)</option>
              <option>3,000,000 BBL (ULCC)</option>
            </select>
          </div>
          <div class="flex flex-col">
            <label class="text-gray-300 text-sm mb-1">Deal Type</label>
            <select class="p-2 rounded text-black w-full bg-gray-100">
              <option>Spot</option>
              <option>Term Contract (Monthly Delivery)</option>
              <option>One-Time Cargo</option>
              <option>Trial Shipment</option>
              <option>Long-Term Supply Agreement</option>
            </select>
          </div>
        </div>

        <!-- Delivery Term -->
        <div class="flex-item-field gap-2">
          <label class="text-gray-300 text-sm">Delivery Term</label>
          <select class="p-2 rounded text-black w-full bg-gray-100 bg-gray-100">
            <option>FOB</option>
            <option>CFR</option>
            <option>CIF</option>
            <option>DAP</option>
            <option>DES</option>
            <option>DDP</option>
            <option>DDU</option>
            <option>STS</option>
            <option>OPL (Off Port Limits)</option>
            <option>TTO (Tanker Take Over)</option>
          </select>
          <input type="text" placeholder="Delivery details" class="p-2 rounded text-black w-full bg-gray-100" />
          <input type="text" placeholder="Transfer zone / OPL area" class="p-2 rounded text-black w-full bg-gray-100" />
        </div>

        <!-- Price -->
        <div class="flex-item-field justify-start gap-2">
          <span class="text-gray-300">Benchmark-based (Platts Dated Brent ± differential)</span>
          <input type="number" step="0.01" min="0" placeholder="2.50 USD per BBL" class="p-2 rounded text-black w-full bg-gray-100" />
        </div>

        <!-- Payment Term, Operation Cost, Inspection -->
        <div class="grid grid-cols-1 mx-0 justify-center sm:grid-cols-3 gap-4">
          <div class="flex flex-col">
            <label class="text-gray-300 text-sm mb-1">Payment Term</label>
            <select class="p-2 rounded text-black w-full bg-gray-100">
              <option>TT after independent Q&Q inspection (Dip Test)</option>
              <option>100% TT before STS connection</option>
              <option>SBLC (Standby Letter of Credit)</option>
              <option>DLC (Documentary Letter of Credit)</option>
              <option>Escrow Payment</option>
            </select>
          </div>
          <div class="flex flex-col">
            <label class="text-gray-300 text-sm mb-1">Operation Cost</label>
            <select class="p-2 rounded text-black w-full bg-gray-100">
              <option>Standard STS operation included</option>
              <option>Buyer to cover STS costs</option>
              <option>Shared operation costs (50/50)</option>
            </select>
          </div>
          <div class="flex flex-col mx-0">
            <label class="text-gray-300 text-sm mb-1">Inspection</label>
            <select class="p-2 rounded text-black w-full bg-gray-100">
              <option>Independent international surveyor (SGS)</option>
              <option>CCIC</option>
              <option>Intertek</option>
              <option>Other (Equivalent Approved Inspector)</option>
            </select>
          </div>
        </div>

        <!-- Validity -->
        <div class="flex-item-field">
          <label class="text-gray-300 text-sm mb-1">Validity</label>
          <input type="date" class="p-2 rounded text-black w-full bg-gray-100" />
        </div>

        <!-- Buttons -->
        <div class="flex flex-row justify-end gap-2 mt-7">
          <button type="button" class="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 transition w-full sm:w-auto">Cancel</button>
          <button type="submit" class="px-4 py-2 rounded bg-yellow-400 text-black hover:bg-yellow-500 transition w-full sm:w-auto">
            Add
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
@reference "tailwindcss";

.flex-item-field {
  @apply flex flex-col mx-0;
}
</style>

<script lang="ts" setup></script>

<style></style>
