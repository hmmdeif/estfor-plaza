<template>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-2 md:mt-10 mx-auto md:w-[760px]"
    >
        <div class="card-body">
            <div v-if="!core.clanState">
                <div class="text-center">
                    <h2 class="text-2xl font-bold">
                        Sorry friend, but you're not part of a clan
                    </h2>
                    <p class="text-lg mt-5">
                        Please select a hero that has a clan to view the various
                        stats.
                    </p>
                </div>
            </div>
            <div v-else>
                <div role="tablist" class="tabs tabs-border tabs-lg mb-4">
                    <router-link
                        to="/clan-management/wishing-well"
                        role="tab"
                        class="tab"
                        :class="{
                            'tab-active': route.path.includes('wishing-well'),
                        }"
                        >Wish Contributions</router-link
                    >
                </div>
                <span
                    v-if="loading"
                    class="loading loading-spinner text-primary loading-md mx-auto"
                ></span>
                <RouterView v-else :members="clanMembers" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useCoreStore } from "../store/core"
import { useRoute } from "vue-router"
import { ClanMember, getClanMembers } from "../utils/api"

const route = useRoute()
const core = useCoreStore()
const loading = ref(false)
const clanMembers = ref<ClanMember[]>([])

const init = async () => {
    loading.value = true
    try {
        if (core.clanState) {
            const membersResult = await getClanMembers(
                core.clanState.id,
            )
            clanMembers.value = membersResult.clanMembers
        }
    } finally {
        loading.value = false
    }
}

onMounted(init)
</script>
