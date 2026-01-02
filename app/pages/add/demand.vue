<script setup>
definePageMeta({
  middleware: ['auth'],
})

import { z } from 'zod'
import { reactive, ref } from 'vue'

const { showError } = useErrorModal()
const { showSuccess } = useSuccessModal()

const errors = ref({})

const data = reactive({
  document_type: 'RFQ – Request for Quotation',
  product: 'Light Crude Oil',

  api_min: null,
  api_max: null,
  sulfur_max: null,

  quantity: null,
  deal_type: 'Spot',
  delivery_term: 'FOB',
  delivery_detail: '',
  transfer_zone: '',

  benchmark_based: null,
  payment_term: 'TT after independent Q&Q inspection (Dip Test)',
  operation_cost: 'Standard STS operation included',
  down_payment: 'After Dip Test',

  target_price: null,
  validity: '',
})

const schema = z
  .object({
    document_type: z.string().min(1, 'Document type is required'),
    product: z.string().min(1, 'Product is required'),

    api_min: z.number({ message: 'API Min is required' }).min(0, 'API Min must be >= 0'),
    api_max: z.number({ message: 'API Max is required' }).min(0, 'API Max must be >= 0'),
    sulfur_max: z.number({ message: 'Sulfur Max is required' }).min(0, 'Sulfur Max must be >= 0').max(5, 'Sulfur Max must be <= 5'),

    quantity: z.number({ message: 'Quantity is required' }).positive('Quantity must be greater than 0'),

    deal_type: z.string().min(1, 'Deal type is required'),
    delivery_term: z.string().min(1, 'Delivery term is required'),
    delivery_detail: z.string().min(1, 'Delivery details are required'),
    transfer_zone: z.string().min(1, 'Transfer zone is required'),

    benchmark_based: z.number({ message: 'Benchmark differential is required' }),
    payment_term: z.string().min(1, 'Payment term is required'),
    operation_cost: z.string().min(1, 'Operation cost is required'),
    down_payment: z.string().min(1, 'Down payment is required'),

    target_price: z.number({ message: 'Target price is required' }).min(1, 'Target price must be greater than 1'),
    validity: z.string().min(1, 'Validity date is required'),
  })
  .refine((v) => v.api_max >= v.api_min, {
    message: 'API Max must be >= API Min',
    path: ['api_max'],
  })

async function onSubmit(e) {
  e.preventDefault()

  const result = schema.safeParse(data)

  if (!result.success) {
    errors.value = result.error.flatten((issue) => issue.message).fieldErrors
    return
  }
  errors.value = {}

  try {
    // if your backend reads user from session, you do NOT need user_id here
    const res = await $fetch('/api/demand', {
      method: 'POST',
      body: result.data,
    })

    showSuccess({
      title: 'Demand Created',
      message: res.message || 'Your demand has been placed successfully.',
    })

    await navigateTo('/dashboard')
  } catch (error) {
    showError({
      title: error?.data?.statusMessage || 'CRITICAL',
      message: error?.data?.message || 'An unexpected error occurred.',
    })
  }
}
</script>

<template>
  <main id="demandModal" class="flex max-w-full items-center justify-center p-4 sm:p-6 w-full">
    <div class="bg-gray-800 p-8 rounded relative max-w-2xl w-full">
      <h2 class="font-semibold text-yellow-400 mb-4">Add Demand</h2>

      <form class="space-y-6 space-x-3" @submit.prevent="onSubmit">
        <!-- Document Type -->
        <div class="flex-item-field">
          <label class="block text-gray-300 text-sm mb-1">Document Type</label>
          <select class="p-2 rounded text-black w-full bg-gray-100" v-model="data.document_type">
            <optgroup label="Buy-Side (Request)">
              <option>RFQ – Request for Quotation</option>
              <option>LOI – Letter of Intent</option>
              <option>ICPO – Irrevocable Corporate Purchase Order (Draft)</option>
            </optgroup>
            <optgroup label="Other">
              <option>EOI – Expression of Interest</option>
              <option>Term Sheet</option>
            </optgroup>
          </select>
          <label v-if="errors.document_type?.[0]" class="text-red-400 text-sm mb-1">
            {{ errors.document_type[0] }}
          </label>
        </div>

        <!-- Product -->
        <div class="flex-item-field">
          <label class="text-gray-300 text-sm mb-1">Product</label>
          <select class="p-2 rounded text-black w-full bg-gray-100" v-model="data.product">
            <option>Light Crude Oil</option>
            <option>Heavy Crude Oil</option>
            <option>Super Heavy Crude Oil</option>
          </select>
          <label v-if="errors.product?.[0]" class="text-red-400 text-sm mb-1">
            {{ errors.product[0] }}
          </label>
        </div>

        <!-- Specification -->
        <div class="grid grid-cols-1 mx-0 sm:grid-cols-2 gap-4">
          <div class="flex-1 flex flex-col">
            <label class="text-gray-300 text-sm mb-1">API Min</label>
            <input
              type="number"
              v-model="data.api_min"
              step="0.1"
              min="0"
              placeholder="34.0"
              class="p-2 rounded text-black w-full bg-gray-100"
            />
            <label v-if="errors.api_min?.[0]" class="text-red-400 text-sm mb-1">
              {{ errors.api_min[0] }}
            </label>
          </div>

          <div class="flex-1 flex flex-col">
            <label class="text-gray-300 text-sm mb-1">API Max</label>
            <input
              type="number"
              v-model="data.api_max"
              step="0.1"
              min="0"
              placeholder="40.0"
              class="p-2 rounded text-black w-full bg-gray-100"
            />
            <label v-if="errors.api_max?.[0]" class="text-red-400 text-sm mb-1">
              {{ errors.api_max[0] }}
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 mx-0 sm:grid-cols-2 gap-4">
          <div class="flex-1 flex flex-col">
            <label class="text-gray-300 text-sm mb-1">Sulfur Max</label>
            <input
              type="number"
              v-model="data.sulfur_max"
              step="0.01"
              min="0"
              max="5"
              placeholder="1.2"
              class="p-2 rounded text-black w-full bg-gray-100"
            />
            <label v-if="errors.sulfur_max?.[0]" class="text-red-400 text-sm mb-1">
              {{ errors.sulfur_max[0] }}
            </label>
          </div>

          <div class="flex flex-col">
            <label class="text-gray-300 text-sm mb-1">Quantity</label>
            <div class="relative">
              <input
                type="number"
                v-model="data.quantity"
                class="p-2 pr-14 rounded text-black w-full bg-gray-100"
                placeholder="Enter quantity"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">BBL</span>
            </div>
            <label v-if="errors.quantity?.[0]" class="text-red-400 text-sm mb-1">
              {{ errors.quantity[0] }}
            </label>
          </div>
        </div>

        <!-- Deal Type -->
        <div class="flex-item-field">
          <label class="text-gray-300 text-sm mb-1">Deal Type</label>
          <select class="p-2 rounded text-black w-full bg-gray-100" v-model="data.deal_type">
            <option>Spot</option>
            <option>Term Contract (Monthly Delivery)</option>
            <option>One-Time Cargo</option>
            <option>Trial Shipment</option>
            <option>Long-Term Supply Agreement</option>
          </select>
          <label v-if="errors.deal_type?.[0]" class="text-red-400 text-sm mb-1">
            {{ errors.deal_type[0] }}
          </label>
        </div>

        <!-- Delivery Term -->
        <div class="flex-item-field gap-2">
          <label class="text-gray-300 text-sm">Delivery Term</label>
          <select class="p-2 rounded text-black w-full bg-gray-100" v-model="data.delivery_term">
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
          <label v-if="errors.delivery_term?.[0]" class="text-red-400 text-sm mb-1">
            {{ errors.delivery_term[0] }}
          </label>

          <input
            type="text"
            v-model="data.delivery_detail"
            placeholder="Delivery details"
            class="p-2 rounded text-black w-full bg-gray-100"
          />
          <label v-if="errors.delivery_detail?.[0]" class="text-red-400 text-sm mb-1">
            {{ errors.delivery_detail[0] }}
          </label>

          <input
            type="text"
            v-model="data.transfer_zone"
            placeholder="Transfer zone / OPL area"
            class="p-2 rounded text-black w-full bg-gray-100"
          />
          <label v-if="errors.transfer_zone?.[0]" class="text-red-400 text-sm mb-1">
            {{ errors.transfer_zone[0] }}
          </label>
        </div>

        <!-- Benchmark -->
        <div class="flex-item-field justify-start gap-2">
          <span class="text-gray-300">Benchmark-based (Platts Dated Brent ± differential)</span>
          <input
            type="number"
            v-model="data.benchmark_based"
            step="0.01"
            placeholder="2.50 USD per BBL"
            class="p-2 rounded text-black w-full bg-gray-100"
          />
          <label v-if="errors.benchmark_based?.[0]" class="text-red-400 text-sm mb-1">
            {{ errors.benchmark_based[0] }}
          </label>
        </div>

        <!-- Payment & Operation -->
        <div class="grid grid-cols-1 mx-0 justify-center sm:grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label class="text-gray-300 text-sm mb-1">Payment Term</label>
            <select class="p-2 rounded text-black w-full bg-gray-100" v-model="data.payment_term">
              <option>TT after independent Q&Q inspection (Dip Test)</option>
              <option>100% TT before STS connection</option>
              <option>SBLC (Standby Letter of Credit)</option>
              <option>DLC (Documentary Letter of Credit)</option>
              <option>Escrow Payment</option>
            </select>
            <label v-if="errors.payment_term?.[0]" class="text-red-400 text-sm mb-1">
              {{ errors.payment_term[0] }}
            </label>
          </div>

          <div class="flex flex-col">
            <label class="text-gray-300 text-sm mb-1">Operation Cost</label>
            <select class="p-2 rounded text-black w-full bg-gray-100" v-model="data.operation_cost">
              <option>Standard STS operation included</option>
              <option>Buyer to cover STS costs</option>
              <option>Shared operation costs (50/50)</option>
            </select>
            <label v-if="errors.operation_cost?.[0]" class="text-red-400 text-sm mb-1">
              {{ errors.operation_cost[0] }}
            </label>
          </div>
        </div>

        <div class="flex-item-field">
          <label class="text-gray-300 text-sm mb-1">Down Payment</label>
          <select class="p-2 rounded text-black w-full bg-gray-100" v-model="data.down_payment">
            <option>After Dip Test</option>
            <option>Before Dip Test</option>
            <option>LC</option>
            <option>BG</option>
            <option>Escrow Account Deposit</option>
            <option>Back To Back Deal</option>
          </select>
          <label v-if="errors.down_payment?.[0]" class="text-red-400 text-sm mb-1">
            {{ errors.down_payment[0] }}
          </label>
        </div>

        <!-- Target Price -->
        <div class="flex-item-field">
          <label class="text-gray-300 text-sm mb-1">Target Price</label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Enter target price (USD/BBL)"
            v-model="data.target_price"
            class="p-2 rounded text-black w-full bg-gray-100"
          />
          <label v-if="errors.target_price?.[0]" class="text-red-400 text-sm mb-1">
            {{ errors.target_price[0] }}
          </label>
        </div>

        <!-- Validity -->
        <div class="flex-item-field">
          <label class="text-gray-300 text-sm mb-1">Validity</label>
          <input type="date" v-model="data.validity" class="p-2 rounded text-black w-full bg-gray-100" />
          <label v-if="errors.validity?.[0]" class="text-red-400 text-sm mb-1">
            {{ errors.validity[0] }}
          </label>
        </div>

        <!-- Buttons -->
        <div class="flex flex-row justify-end gap-2 mt-7">
          <button
            type="button"
            class="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 transition w-full sm:w-auto"
            v-on:click="navigateTo('/dashboard')"
          >
            Cancel
          </button>
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
