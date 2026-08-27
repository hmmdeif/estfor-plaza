<template>
    <div class="card bg-base-100-50 shadow-xl rounded-lg my-2 md:mt-10">
        <div class="card-body">
            <div class="join items-center mr-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6 mr-2 text-primary"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                </svg>
                <input
                    type="text"
                    placeholder="Item Search"
                    class="input w-full input-bordered bg-base-100-50"
                    v-model="itemStore.itemSearch"
                    list="item-datalist-card"
                />
                <datalist id="item-datalist-card">
                    <option v-for="name in searchableItemNames" :key="name" :value="name" />
                </datalist>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useItemStore } from "../store/items"
import { searchableItemNames } from "../data/generated/searchableItemNames"

const itemStore = useItemStore()
</script>
